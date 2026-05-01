const { body } = require('express-validator');

exports.createRatingRules = [
  body('request_id')
    .notEmpty().withMessage('request_id is required')
    .isMongoId().withMessage('request_id must be a valid ID'),

  body('rated_id')
    .notEmpty().withMessage('rated_id is required')
    .isMongoId().withMessage('rated_id must be a valid ID'),

  body('stars')
    .notEmpty().withMessage('Stars rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer between 1 and 5'),

  body('comment')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters'),
];
