const { Listing, Rating } = require('../models');

exports.getAll = async ({ domain, type, is_urgent, search, sort }) => {
  const filter = { status: 'available' };
  if (domain)              filter.domain    = domain;
  if (type)                filter.type      = type;
  if (is_urgent === 'true') filter.is_urgent = true;
  if (search)              filter.title     = { $regex: search, $options: 'i' };

  const sortObj = sort === 'urgent'
    ? { is_urgent: -1, createdAt: -1 }
    : { createdAt: -1 };

  return Listing.find(filter)
    .sort(sortObj)
    .populate('user_id', 'name trust_points college year is_verified');
};

exports.getMy = async (userId) =>
  Listing.find({ user_id: userId }).sort({ createdAt: -1 });

exports.getById = async (id) => {
  const listing = await Listing.findById(id)
    .populate('user_id', 'name trust_points college year is_verified');

  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }

  const ratings = await Rating.find({ rated_id: listing.user_id._id });
  const avg = ratings.length
    ? (ratings.reduce((s, r) => s + r.stars, 0) / ratings.length).toFixed(1)
    : 0;

  const similar = await Listing.find({
    domain: listing.domain,
    status: 'available',
    _id:    { $ne: listing._id },
  }).limit(3).select('title type domain user_id').populate('user_id', 'name');

  return {
    ...listing.toObject(),
    seller_rating:        Number(avg),
    seller_ratings_count: ratings.length,
    similar_listings:     similar,
  };
};

exports.create = async (userId, body) => {
  const { title, description, domain, category, type, price, condition, is_urgent } = body;

  return Listing.create({
    user_id:   userId,
    title, description, domain, category, type,
    price:     type === 'sell' ? price : null,
    condition,
    is_urgent: is_urgent || false,
  });
};

exports.remove = async (listingId, userId) => {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  if (listing.user_id.toString() !== userId) {
    const err = new Error('You do not own this listing');
    err.statusCode = 403;
    throw err;
  }
  await listing.deleteOne();
};
