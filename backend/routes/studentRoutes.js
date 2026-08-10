const express = require('express');
const {
  getMyProfile,
  updateProfile,
  getEligibleDrives,
  checkDriveEligibility,
  applyToDrive,
  getMyApplications,
  getPublishedDrives,
} = require('../controllers/studentController');
const { updateProfileValidator } = require('../validators/studentValidator');
const validate = require('../middleware/validate');
const { protect, authorize, requireVerified } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('student'), requireVerified);

router.get('/profile', getMyProfile);
router.put('/profile', updateProfileValidator, validate, updateProfile);
router.get('/drives', getPublishedDrives);
router.get('/drives/eligible', getEligibleDrives);
router.get('/drives/:driveId/eligibility', checkDriveEligibility);
router.post('/drives/:driveId/apply', applyToDrive);
router.get('/applications', getMyApplications);

module.exports = router;
