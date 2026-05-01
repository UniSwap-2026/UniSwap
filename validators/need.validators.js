const { body } = require('express-validator');

const VALID_DOMAINS = ['medical', 'engineering', 'arts'];

exports.createNeedRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),

  body('domain')
    .notEmpty().withMessage('Domain is required')
    .isIn(VALID_DOMAINS).withMessage(`Domain must be one of: ${VALID_DOMAINS.join(', ')}`),

  body('is_urgent')
    .optional()
    .isBoolean().withMessage('is_urgent must be true or false'),
];
