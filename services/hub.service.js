const { HubContent, User } = require('../models');

exports.getAll = async ({ domain, type, search }) => {
  const filter = {};
  if (domain) filter.domain = domain;
  if (type)   filter.type   = type;
  if (search) filter.title  = { $regex: search, $options: 'i' };

  return HubContent.find(filter)
    .sort({ downloads: -1 })
    .populate('user_id', 'name');
};

exports.upload = async ({ title, type, domain, year, file_url }, userId) => {
  const item = await HubContent.create({ user_id: userId, title, type, domain, year, file_url });
  await User.findByIdAndUpdate(userId, { $inc: { trust_points: 5 } });
  return item;
};

exports.incrementDownload = async (id) => {
  const item = await HubContent.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  if (!item) {
    const err = new Error('Content not found');
    err.statusCode = 404;
    throw err;
  }
};
