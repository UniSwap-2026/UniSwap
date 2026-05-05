const { Message, Request, Listing } = require('../models');

exports.getConversations = async (userId) => {
  // Get listings owned by the user
  const myListings = await Listing.find({ user_id: userId }).select('_id');
  const myListingIds = myListings.map(l => l._id);

  const requests = await Request.find({
    $or: [
      { requester_id: userId },
      { listing_id: { $in: myListingIds } }
    ],
    status: { $in: ['pending', 'accepted', 'done'] },
  })
    .populate({ path: 'listing_id', populate: { path: 'user_id', select: 'name _id' } })
    .populate('requester_id', 'name _id');

  return Promise.all(
    requests.map(async (r) => {
      const lastMsg = await Message.findOne({ request_id: r._id }).sort({ sent_at: -1 });
      const unread  = await Message.countDocuments({
        request_id: r._id,
        sender_id:  { $ne: userId },
        is_read:    false,
      });

      const isOwner   = r.listing_id.user_id._id.toString() === userId;
      const otherUser = isOwner ? r.requester_id : r.listing_id.user_id;

      return {
        request_id:    r._id,
        listing_title: r.listing_id.title,
        other_user:    { _id: otherUser._id, name: otherUser.name },
        my_code:       isOwner ? r.exchange_code_a : r.exchange_code_b,
        last_message:  lastMsg?.body || null,
        updatedAt:     lastMsg?.sent_at || r.updatedAt,
        unread_count:  unread,
      };
    })
  );
};

exports.getByRequest = async (requestId, userId) => {
  const messages = await Message.find({ request_id: requestId })
    .sort({ sent_at: 1 })
    .populate('sender_id', 'name');

  await Message.updateMany(
    { request_id: requestId, sender_id: { $ne: userId } },
    { is_read: true }
  );

  return messages;
};

exports.send = async ({ request_id, body }, senderId) => {
  return Message.create({ request_id, sender_id: senderId, body });
};
