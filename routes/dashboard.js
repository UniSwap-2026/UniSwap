const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const dashService  = require('../services/dashboard.service');

// GET /api/dashboard
router.get('/', auth, asyncHandler(async (req, res) => {
  const data = await dashService.getStats(req.user.id);
  res.json({ success: true, data });
}));

// GET /api/dashboard/notifications
router.get('/notifications', auth, asyncHandler(async (req, res) => {
  const { notifications, unread } = await dashService.getNotifications(req.user.id);
  res.json({ success: true, data: notifications, unread_count: unread });
}));

// PATCH /api/dashboard/notifications/read
router.patch('/notifications/read', auth, asyncHandler(async (req, res) => {
  await dashService.markAllRead(req.user.id);
  res.json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
