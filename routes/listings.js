const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { createListingRules, listingIdRule } = require('../validators/listing.validators');
const listingService = require('../services/listing.service');

// GET /api/listings
router.get('/', asyncHandler(async (req, res) => {
  const data = await listingService.getAll(req.query);
  res.json({ success: true, count: data.length, data });
}));

// GET /api/listings/user/my  — must be before /:id
router.get('/user/my', auth, asyncHandler(async (req, res) => {
  const data = await listingService.getMy(req.user.id);
  res.json({ success: true, data });
}));

// GET /api/listings/:id
router.get(
  '/:id',
  listingIdRule,
  validate,
  asyncHandler(async (req, res) => {
    const data = await listingService.getById(req.params.id);
    res.json({ success: true, data });
  })
);

// POST /api/listings
router.post(
  '/',
  auth,
  createListingRules,
  validate,
  asyncHandler(async (req, res) => {
    const data = await listingService.create(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Listing published!', data });
  })
);

// DELETE /api/listings/:id
router.delete(
  '/:id',
  auth,
  listingIdRule,
  validate,
  asyncHandler(async (req, res) => {
    await listingService.remove(req.params.id, req.user.id);
    res.json({ success: true, message: 'Listing deleted' });
  })
);

module.exports = router;
