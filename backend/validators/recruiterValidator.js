const { body } = require('express-validator');

const createJobDriveValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('applicationDeadline').isISO8601().withMessage('Valid deadline is required'),
  body('company').optional().isMongoId(),
];

const createCompanyValidator = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
];

module.exports = { createJobDriveValidator, createCompanyValidator };
