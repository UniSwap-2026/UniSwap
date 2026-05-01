const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { createNeedRules } = require('../validators/need.validators');
const needService  = require('../services/need.service');

// GET /api/needs
router.get('/', asyncHandler(async (req, res) => {
  const data = await needService.getAll(req.query);
  res.json({ success: true, data });
}));

// POST /api/needs
router.post(
  '/',
  auth,
  createNeedRules,
  validate,
  asyncHandler(async (req, res) => {
    const result = await needService.create(req.body, req.user);
    const message = result.matched
      ? 'Need posted! We found smart matches for you.'
      : "Need posted! We'll notify you when someone has a match.";
    res.status(201).json({ success: true, message, data: result });
  })
);

module.exports = router;
