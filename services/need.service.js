const { Need, Listing, Notification } = require('../models');

exports.getAll = async ({ domain, search }) => {
  const filter = { status: 'open' };
  if (domain) filter.domain = domain;
  if (search) filter.title  = { $regex: search, $options: 'i' };

  return Need.find(filter)
    .sort({ is_urgent: -1, createdAt: -1 })
    .populate('user_id', 'name trust_points');
};

exports.create = async ({ title, domain, is_urgent }, requester) => {
  const need = await Need.create({
    user_id:   requester.id,
    title, domain,
    is_urgent: is_urgent || false,
  });

  // Smart Match
  const keywords = title.split(' ').filter((w) => w.length > 2);
  let smartMatches = [];

  if (keywords.length > 0) {
    const regexes = keywords.map((k) => new RegExp(k, 'i'));
    smartMatches = await Listing.find({
      status:  'available',
      domain,
      user_id: { $ne: requester.id },
      title:   { $in: regexes },
    }).limit(3).populate('user_id', 'name');

    if (smartMatches.length > 0) {
      await Notification.create({
        user_id: requester.id,
        type:    'match',
        ref_id:  need._id,
        message: `Smart match! ${smartMatches[0].user_id.name} has "${smartMatches[0].title}" — reach out`,
      });

      for (const match of smartMatches) {
        await Notification.create({
          user_id: match.user_id._id,
          type:    'match',
          ref_id:  need._id,
          message: `${requester.name} is looking for "${title}" — you have a matching listing!`,
        });
      }
    }
  }

  return {
    id:           need._id,
    smart_matches: smartMatches,
    matched:      smartMatches.length > 0,
  };
};
