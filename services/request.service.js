const { Request, Listing, Notification, User } = require('../models');

const genCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand  = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${rand(3)}-${rand(3)}`;
};

exports.create = async ({ listing_id, message }, requester) => {
  const listing = await Listing.findById(listing_id);
  if (!listing || listing.status !== 'available') {
    const err = new Error('Listing not found or no longer available');
    err.statusCode = 404;
    throw err;
  }
  if (listing.user_id.toString() === requester.id) {
    const err = new Error('You cannot request your own listing');
    err.statusCode = 400;
    throw err;
  }

  const existing = await Request.findOne({
    listing_id,
    requester_id: requester.id,
    status:       { $ne: 'rejected' },
  });
  if (existing) {
    const err = new Error('You already have a request on this listing');
    err.statusCode = 409;
    throw err;
  }

  const request = await Request.create({ listing_id, requester_id: requester.id, message });

  // Create initial message
  if (message) {
    const { Message } = require('../models');
    await Message.create({
      request_id: request._id,
      sender_id: requester.id,
      body: message
    });
  }

  await Notification.create({
    user_id: listing.user_id,
    type:    'new_request',
    ref_id:  request._id,
    message: `${requester.name} requested your listing — ${listing.title}`,
  });

  return request;
};

exports.accept = async (requestId, userId) => {
  const request = await Request.findById(requestId).populate('listing_id');
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  if (request.listing_id.user_id.toString() !== userId) {
    const err = new Error('You do not own this listing');
    err.statusCode = 403;
    throw err;
  }

  const codeA = genCode();
  const codeB = genCode();
  request.status          = 'accepted';
  request.exchange_code_a = codeA;
  request.exchange_code_b = codeB;
  await request.save();

  await Notification.create({
    user_id: request.requester_id,
    type:    'request_accepted',
    ref_id:  request._id,
    message: `Your request on "${request.listing_id.title}" was accepted`,
  });

  return { exchange_code_seller: codeA, exchange_code_buyer: codeB };
};

exports.reject = async (requestId, userId) => {
  const request = await Request.findById(requestId).populate('listing_id');
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  if (request.listing_id.user_id.toString() !== userId) {
    const err = new Error('You do not own this listing');
    err.statusCode = 403;
    throw err;
  }

  request.status = 'rejected';
  await request.save();

  await Notification.create({
    user_id: request.requester_id,
    type:    'request_rejected',
    ref_id:  request._id,
    message: `Your request on "${request.listing_id.title}" was declined`,
  });
};

exports.confirm = async (requestId, code, userId) => {
  const request = await Request.findById(requestId).populate('listing_id');
  if (!request || request.status !== 'accepted') {
    const err = new Error('Request not found or not accepted yet');
    err.statusCode = 404;
    throw err;
  }

  const isSeller = request.listing_id.user_id.toString() === userId;
  const isBuyer  = request.requester_id.toString()       === userId;

  if (!isSeller && !isBuyer) {
    const err = new Error('You are not part of this transaction');
    err.statusCode = 403;
    throw err;
  }

  const validCode = isSeller ? request.exchange_code_b : request.exchange_code_a;
  if (code !== validCode) {
    const err = new Error('Incorrect exchange code');
    err.statusCode = 400;
    throw err;
  }

  request.status = 'done';
  await request.save();

  await Listing.findByIdAndUpdate(request.listing_id._id, { status: 'closed' });
  await User.findByIdAndUpdate(request.listing_id.user_id, { $inc: { trust_points: 10 } });
  await User.findByIdAndUpdate(request.requester_id,       { $inc: { trust_points: 10 } });

  const notifyId = isSeller ? request.requester_id : request.listing_id.user_id;
  await Notification.create({
    user_id: notifyId,
    type:    'exchange_done',
    ref_id:  request._id,
    message: 'Exchange confirmed successfully! Please rate your experience.',
  });
};

exports.getMy = async (userId) => {
  const myListings = await Listing.find({ user_id: userId }).select('_id');
  const ids = myListings.map((l) => l._id);

  const [incoming, outgoing] = await Promise.all([
    Request.find({ listing_id: { $in: ids } })
      .populate('listing_id', 'title user_id')
      .populate('requester_id', 'name'),
    Request.find({ requester_id: userId })
      .populate({ path: 'listing_id', populate: { path: 'user_id', select: 'name' } }),
  ]);

  return { incoming, outgoing };
};
