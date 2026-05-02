const { body } = require('express-validator');

const VALID_DOMAINS = ['medical', 'engineering', 'arts'];

exports.registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .custom((val) => {
      if (!val.endsWith('.edu.eg')) {
        throw new Error('Must use a university email ending in .edu.eg');
      }
      return true;
    }),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),

  body('domain')
    .notEmpty().withMessage('Academic domain is required')
    .isIn(VALID_DOMAINS).withMessage(`Domain must be one of: ${VALID_DOMAINS.join(', ')}`),

  body('college')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('College name too long'),

  body('year')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Year value too long'),
];

exports.loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];
