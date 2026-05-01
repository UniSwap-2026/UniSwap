const { Listing, Request, Message, Notification, User } = require('../models');

exports.getStats = async (userId) => {
  const myListings = await Listing.find({ user_id: userId }).select('_id');
  const ids = myListings.map((l) => l._id);

  const [listingsCount, pendingCount, completedCount, userInfo, notifications] = await Promise.all([
    Listing.countDocuments({ user_id: userId, status: 'available' }),

    Request.countDocuments({ listing_id: { $in: ids }, status: 'pending' }),

    Request.countDocuments({
      $or: [{ requester_id: userId }, { listing_id: { $in: ids } }],
      status: 'done',
    }),

    User.findById(userId).select('trust_points'),

    Notification.find({ user_id: userId }).sort({ createdAt: -1 }).limit(20),
  ]);

  return {
    listings_count:   listingsCount,
    pending_requests: pendingCount,
    completed_trades: completedCount,
    trust_points:     userInfo?.trust_points || 0,
    notifications,
  };
};

exports.getNotifications = async (userId) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ user_id: userId }).sort({ createdAt: -1 }).limit(20),
    Notification.countDocuments({ user_id: userId, is_read: false }),
  ]);
  return { notifications, unread };
};

exports.markAllRead = async (userId) => {
  await Notification.updateMany({ user_id: userId }, { is_read: true });
};
