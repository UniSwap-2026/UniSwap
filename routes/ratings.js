const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { createRatingRules } = require('../validators/rating.validators');
const ratingService = require('../services/rating.service');

// POST /api/ratings
router.post(
  '/',
  auth,
  createRatingRules,
  validate,
  asyncHandler(async (req, res) => {
    await ratingService.create(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Thank you for your rating!' });
  })
);

module.exports = router;
