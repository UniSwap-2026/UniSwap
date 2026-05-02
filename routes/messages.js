const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { sendMessageRules, requestIdParamRule } = require('../validators/message.validators');
const messageService = require('../services/message.service');

// GET /api/messages
router.get('/', auth, asyncHandler(async (req, res) => {
  const data = await messageService.getConversations(req.user.id);
  res.json({ success: true, data });
}));

// GET /api/messages/:requestId
router.get(
  '/:requestId',
  auth,
  requestIdParamRule,
  validate,
  asyncHandler(async (req, res) => {
    const data = await messageService.getByRequest(req.params.requestId, req.user.id);
    res.json({ success: true, data });
  })
);

// POST /api/messages
router.post(
  '/',
  auth,
  sendMessageRules,
  validate,
  asyncHandler(async (req, res) => {
    const data = await messageService.send(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  })
);

module.exports = router;
