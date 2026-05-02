const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name, domain: user.domain },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const safeUser = (user) => ({
  id:           user._id,
  name:         user.name,
  email:        user.email,
  domain:       user.domain,
  college:      user.college,
  year:         user.year,
  trust_points: user.trust_points,
  is_verified:  user.is_verified,
});

exports.register = async ({ name, email, password, domain, college, year }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('This email is already registered');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash, domain, college, year });

  return { token: signToken(user), user: safeUser(user) };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  return { token: signToken(user), user: safeUser(user) };
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId).select('-password_hash');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};
