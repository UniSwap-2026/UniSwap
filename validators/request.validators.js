const { body, param } = require('express-validator');

exports.createRequestRules = [
  body('listing_id')
    .notEmpty().withMessage('listing_id is required')
    .isMongoId().withMessage('listing_id must be a valid ID'),

  body('message')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Message must not exceed 500 characters'),
];

exports.confirmRequestRules = [
  param('id')
    .isMongoId().withMessage('Invalid request ID'),

  body('code')
    .notEmpty().withMessage('Exchange code is required')
    .matches(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/).withMessage('Invalid code format — expected ABC-123'),
];

exports.requestIdRule = [
  param('id')
    .isMongoId().withMessage('Invalid request ID'),
];
