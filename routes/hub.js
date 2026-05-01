const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { uploadContentRules, hubIdRule } = require('../validators/hub.validators');
const hubService   = require('../services/hub.service');

// GET /api/hub
router.get('/', asyncHandler(async (req, res) => {
  const data = await hubService.getAll(req.query);
  res.json({ success: true, data });
}));

// POST /api/hub
router.post(
  '/',
  auth,
  uploadContentRules,
  validate,
  asyncHandler(async (req, res) => {
    const data = await hubService.upload(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Content uploaded!', data });
  })
);

// PATCH /api/hub/:id/download
router.patch(
  '/:id/download',
  hubIdRule,
  validate,
  asyncHandler(async (req, res) => {
    await hubService.incrementDownload(req.params.id);
    res.json({ success: true });
  })
);

module.exports = router;
