const { Rating, Request, User } = require('../models');

exports.create = async ({ request_id, rated_id, stars, comment }, raterId) => {
  if (raterId === rated_id) {
    const err = new Error('You cannot rate yourself');
    err.statusCode = 400;
    throw err;
  }

  const request = await Request.findById(request_id);
  if (!request || request.status !== 'done') {
    const err = new Error('Deal is not completed yet');
    err.statusCode = 400;
    throw err;
  }

  const existing = await Rating.findOne({ request_id, rater_id: raterId });
  if (existing) {
    const err = new Error('You already rated this deal');
    err.statusCode = 409;
    throw err;
  }

  await Rating.create({ request_id, rater_id: raterId, rated_id, stars, comment });
  await User.findByIdAndUpdate(rated_id, { $inc: { trust_points: stars * 2 } });
};
