const { body } = require('express-validator');

const updateProfileValidator = [
  body('rollNumber').optional().trim(),
  body('phone').optional().trim(),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }),
  body('tenthPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('twelfthPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('backlogs').optional().isInt({ min: 0 }),
  body('graduationYear').optional().isInt({ min: 2020, max: 2035 }),
  body('branch').optional().trim(),
  body('skills').optional().isArray(),
];

module.exports = { updateProfileValidator };
