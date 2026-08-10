const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const { createNotification } = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const evaluateAnswer = (question, answer) => {
  if (question.type === 'coding') {
    return { isCorrect: false, marksAwarded: 0 };
  }
  const isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(answer);
  return { isCorrect, marksAwarded: isCorrect ? question.marks : 0 };
};

const startAssessment = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const assessment = await Assessment.findById(req.params.id);
  if (!profile || !assessment) throw new AppError('Assessment or profile not found', 404);
  if (assessment.status !== 'published' && assessment.status !== 'ongoing') {
    throw new AppError('Assessment is not available', 400);
  }

  const existing = await AssessmentAttempt.findOne({ assessment: assessment._id, student: profile._id });
  if (existing && existing.status !== 'in_progress') {
    throw new AppError('Assessment already submitted', 400);
  }
  if (existing) {
    return ApiResponse.success(res, 200, 'Assessment resumed', existing);
  }

  const attempt = await AssessmentAttempt.create({
    assessment: assessment._id,
    student: profile._id,
    application: req.body.applicationId,
    startedAt: Date.now(),
  });

  let questions = await Question.find({ assessment: assessment._id }).select('-correctAnswer -explanation');
  if (assessment.randomizeQuestions) {
    questions = shuffle(questions).slice(0, assessment.questionCount || questions.length);
  }

  return ApiResponse.success(res, 201, 'Assessment started', { attempt, questions, duration: assessment.duration });
});

const submitAssessment = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const attempt = await AssessmentAttempt.findOne({
    assessment: req.params.id,
    student: profile._id,
    status: 'in_progress',
  });
  if (!attempt) throw new AppError('No active attempt found', 404);

  const assessment = await Assessment.findById(req.params.id);
  const questions = await Question.find({ assessment: assessment._id });

  let totalScore = 0;
  const answers = [];

  for (const ans of req.body.answers || []) {
    const question = questions.find((q) => q._id.toString() === ans.question);
    if (!question) continue;
    const evaluation = evaluateAnswer(question, ans.answer);
    totalScore += evaluation.marksAwarded;
    answers.push({
      question: question._id,
      answer: ans.answer,
      isCorrect: evaluation.isCorrect,
      marksAwarded: evaluation.marksAwarded,
    });
  }

  attempt.answers = answers;
  attempt.score = totalScore;
  attempt.percentage = assessment.totalMarks ? (totalScore / assessment.totalMarks) * 100 : 0;
  attempt.status = req.body.autoSubmit ? 'auto_submitted' : 'submitted';
  attempt.submittedAt = Date.now();
  attempt.timeSpent = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);
  attempt.result = totalScore >= assessment.passingMarks ? 'pass' : 'fail';
  await attempt.save();

  if (attempt.application) {
    const application = await Application.findById(attempt.application);
    if (application) {
      application.status = attempt.result === 'pass' ? 'assessment_completed' : 'rejected';
      await application.save();
    }
  }

  await createNotification({
    userId: req.user._id,
    type: 'result',
    title: 'Assessment Result',
    message: `Your assessment score: ${totalScore}/${assessment.totalMarks} (${attempt.result})`,
    relatedEntity: { entityType: 'AssessmentAttempt', entityId: attempt._id },
  });

  return ApiResponse.success(res, 200, 'Assessment submitted', {
    score: totalScore,
    percentage: attempt.percentage,
    result: attempt.result,
    passingMarks: assessment.passingMarks,
  });
});

const getAttemptResult = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const attempt = await AssessmentAttempt.findOne({ assessment: req.params.id, student: profile._id })
    .populate('assessment');
  if (!attempt) throw new AppError('Attempt not found', 404);
  return ApiResponse.success(res, 200, 'Result fetched', attempt);
});

const getAssessmentResults = asyncHandler(async (req, res) => {
  const attempts = await AssessmentAttempt.find({ assessment: req.params.id })
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .sort('-score');
  return ApiResponse.success(res, 200, 'Assessment results fetched', attempts);
});

module.exports = { startAssessment, submitAssessment, getAttemptResult, getAssessmentResults };
