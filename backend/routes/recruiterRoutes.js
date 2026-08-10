const express = require('express');
const {
  getRecruiterProfile,
  createJobDrive,
  updateJobDrive,
  publishJobDrive,
  getMyDrives,
  getApplicants,
  shortlistApplicant,
  rejectApplicant,
  createSelectionRound,
  scheduleInterview,
  recordInterviewResult,
  createAssessment,
  addQuestion,
  updateCompany,
} = require('../controllers/recruiterController');
const { createJobDriveValidator } = require('../validators/recruiterValidator');
const validate = require('../middleware/validate');
const { protect, authorize, requireVerified } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('recruiter'), requireVerified);

router.get('/profile', getRecruiterProfile);
router.put('/company', updateCompany);
router.post('/drives', createJobDriveValidator, validate, createJobDrive);
router.get('/drives', getMyDrives);
router.put('/drives/:id', updateJobDrive);
router.patch('/drives/:id/publish', publishJobDrive);
router.get('/drives/:driveId/applicants', getApplicants);
router.patch('/applications/:applicationId/shortlist', shortlistApplicant);
router.patch('/applications/:applicationId/reject', rejectApplicant);
router.post('/rounds', createSelectionRound);
router.post('/interviews', scheduleInterview);
router.patch('/interviews/:id/result', recordInterviewResult);
router.post('/assessments', createAssessment);
router.post('/assessments/:assessmentId/questions', addQuestion);

module.exports = router;
