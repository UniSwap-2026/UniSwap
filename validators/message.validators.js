const { body, param } = require('express-validator');

exports.sendMessageRules = [
  body('request_id')
    .notEmpty().withMessage('request_id is required')
    .isMongoId().withMessage('request_id must be a valid ID'),

  body('body')
    .trim()
    .notEmpty().withMessage('Message body is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Message must not exceed 2000 characters'),
];

exports.requestIdParamRule = [
  param('requestId')
    .isMongoId().withMessage('Invalid request ID'),
];
