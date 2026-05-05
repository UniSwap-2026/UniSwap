const { body, param } = require('express-validator');

const VALID_DOMAINS = ['medical', 'engineering', 'arts'];
const VALID_TYPES   = ['summary', 'notes', 'exam'];

exports.uploadContentRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

  body('type')
    .notEmpty().withMessage('Content type is required')
    .isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),

  body('domain')
    .notEmpty().withMessage('Domain is required')
    .isIn(VALID_DOMAINS).withMessage(`Domain must be one of: ${VALID_DOMAINS.join(', ')}`),

  body('file_url')
    .notEmpty().withMessage('File URL is required'),

  body('year')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Year value too long'),
];

exports.hubIdRule = [
  param('id')
    .isMongoId().withMessage('Invalid content ID'),
];
