const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const {
  createRequestRules,
  confirmRequestRules,
  requestIdRule,
} = require('../validators/request.validators');
const requestService = require('../services/request.service');

// POST /api/requests
router.post(
  '/',
  auth,
  createRequestRules,
  validate,
  asyncHandler(async (req, res) => {
    const data = await requestService.create(req.body, req.user);
    res.status(201).json({ success: true, message: 'Request sent!', data: { id: data._id } });
  })
);

// GET /api/requests/my  — must be before /:id
router.get('/my', auth, asyncHandler(async (req, res) => {
  const data = await requestService.getMy(req.user.id);
  res.json({ success: true, data });
}));

// PATCH /api/requests/:id/accept
router.patch(
  '/:id/accept',
  auth,
  requestIdRule,
  validate,
  asyncHandler(async (req, res) => {
    const data = await requestService.accept(req.params.id, req.user.id);
    res.json({ success: true, message: 'Request accepted! Exchange codes generated.', data });
  })
);

// PATCH /api/requests/:id/reject
router.patch(
  '/:id/reject',
  auth,
  requestIdRule,
  validate,
  asyncHandler(async (req, res) => {
    await requestService.reject(req.params.id, req.user.id);
    res.json({ success: true, message: 'Request rejected' });
  })
);

// PATCH /api/requests/:id/confirm
router.patch(
  '/:id/confirm',
  auth,
  confirmRequestRules,
  validate,
  asyncHandler(async (req, res) => {
    await requestService.confirm(req.params.id, req.body.code, req.user.id);
    res.json({ success: true, message: 'Exchange confirmed! Deal complete.' });
  })
);

module.exports = router;
