const express      = require('express');
const router       = express.Router();
const asyncHandler = require('express-async-handler');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth.validators');
const authService  = require('../services/auth.service');

// POST /api/auth/register
router.post(
  '/register',
  registerRules,
  validate,
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Account created successfully!', ...result });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  loginRules,
  validate,
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.json({ success: true, message: 'Logged in successfully!', ...result });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, user });
  })
);

module.exports = router;
