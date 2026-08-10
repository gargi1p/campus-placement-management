const express = require('express');
const { startAssessment, submitAssessment, getAttemptResult, getAssessmentResults } = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/start', protect, authorize('student'), startAssessment);
router.post('/:id/submit', protect, authorize('student'), submitAssessment);
router.get('/:id/result', protect, authorize('student'), getAttemptResult);
router.get('/:id/results', protect, authorize('recruiter', 'admin'), getAssessmentResults);

module.exports = router;
