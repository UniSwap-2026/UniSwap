const { body, param } = require('express-validator');

const VALID_DOMAINS    = ['medical', 'engineering', 'arts'];
const VALID_TYPES      = ['donate', 'swap', 'sell'];
const VALID_CONDITIONS = ['excellent', 'very_good', 'good', 'acceptable'];

exports.createListingRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),

  body('domain')
    .notEmpty().withMessage('Domain is required')
    .isIn(VALID_DOMAINS).withMessage(`Domain must be one of: ${VALID_DOMAINS.join(', ')}`),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),

  body('condition')
    .notEmpty().withMessage('Condition is required')
    .isIn(VALID_CONDITIONS).withMessage(`Condition must be one of: ${VALID_CONDITIONS.join(', ')}`),

  body('price')
    .if(body('type').equals('sell'))
    .notEmpty().withMessage('Price is required for sell listings')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('is_urgent')
    .optional()
    .isBoolean().withMessage('is_urgent must be true or false'),

  body('category')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Category too long'),
];

exports.listingIdRule = [
  param('id')
    .isMongoId().withMessage('Invalid listing ID'),
];
