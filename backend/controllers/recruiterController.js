const Company = require('../models/Company');
const JobDrive = require('../models/JobDrive');
const Recruiter = require('../models/Recruiter');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const SelectionRound = require('../models/SelectionRound');
const Interview = require('../models/Interview');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const { createNotification } = require('../services/notificationService');
const { logActivity } = require('../services/auditService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { buildPagination } = require('../utils/pagination');

const getRecruiterProfile = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id }).populate('company');
  if (!recruiter) throw new AppError('Recruiter profile not found', 404);
  return ApiResponse.success(res, 200, 'Recruiter profile fetched', recruiter);
});

const createJobDrive = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id });
  if (!recruiter) throw new AppError('Recruiter profile not found', 404);

  const drive = await JobDrive.create({
    ...req.body,
    company: req.body.company || recruiter.company,
    recruiter: recruiter._id,
  });

  await logActivity({ userId: req.user._id, action: 'CREATE_DRIVE', entity: 'JobDrive', entityId: drive._id, req });

  return ApiResponse.success(res, 201, 'Job drive created', drive);
});

const updateJobDrive = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id });
  let drive = await JobDrive.findOne({ _id: req.params.id, recruiter: recruiter._id });
  if (!drive) throw new AppError('Job drive not found', 404);

  Object.assign(drive, req.body);
  await drive.save();

  return ApiResponse.success(res, 200, 'Job drive updated', drive);
});

const publishJobDrive = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id });
  const drive = await JobDrive.findOneAndUpdate(
    { _id: req.params.id, recruiter: recruiter._id },
    { status: 'published' },
    { new: true }
  ).populate('company');
  if (!drive) throw new AppError('Job drive not found', 404);

  return ApiResponse.success(res, 200, 'Job drive published', drive);
});

const getMyDrives = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id });
  const { page = 1, limit = 10, status } = req.query;
  const filter = { recruiter: recruiter._id };
  if (status) filter.status = status;

  const total = await JobDrive.countDocuments(filter);
  const drives = await JobDrive.find(filter)
    .populate('company')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Drives fetched', drives, buildPagination(page, limit, total));
});

const getApplicants = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id });
  const drive = await JobDrive.findOne({ _id: req.params.driveId, recruiter: recruiter._id });
  if (!drive) throw new AppError('Job drive not found', 404);

  const { page = 1, limit = 10, status, minCgpa, branch } = req.query;
  const filter = { jobDrive: drive._id };
  if (status) filter.status = status;

  let query = Application.find(filter).populate({
    path: 'student',
    populate: [{ path: 'user', select: 'name email' }, { path: 'resume' }],
  });

  if (minCgpa || branch) {
    const studentFilter = {};
    if (minCgpa) studentFilter.cgpa = { $gte: parseFloat(minCgpa) };
    if (branch) studentFilter.branch = branch;
    const students = await StudentProfile.find(studentFilter).select('_id');
    filter.student = { $in: students.map((s) => s._id) };
    query = Application.find(filter).populate({
      path: 'student',
      populate: [{ path: 'user', select: 'name email' }, { path: 'resume' }],
    });
  }

  const total = await Application.countDocuments(filter);
  const applicants = await query.sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Applicants fetched', applicants, buildPagination(page, limit, total));
});

const shortlistApplicant = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId).populate({
    path: 'student',
    populate: { path: 'user' },
  });
  if (!application) throw new AppError('Application not found', 404);

  application.status = 'shortlisted';
  application.shortlistedAt = Date.now();
  application.currentRound = 'shortlisting';
  await application.save();

  await createNotification({
    userId: application.student.user._id,
    type: 'shortlisting',
    title: 'You have been shortlisted!',
    message: 'Congratulations! You have been shortlisted for the next round.',
    relatedEntity: { entityType: 'Application', entityId: application._id },
  });

  return ApiResponse.success(res, 200, 'Applicant shortlisted', application);
});

const rejectApplicant = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId).populate({
    path: 'student',
    populate: { path: 'user' },
  });
  if (!application) throw new AppError('Application not found', 404);

  application.status = 'rejected';
  application.rejectedAt = Date.now();
  application.rejectionReason = req.body.reason || 'Not selected';
  await application.save();

  await createNotification({
    userId: application.student.user._id,
    type: 'rejection',
    title: 'Application Update',
    message: `Your application was not selected. Reason: ${application.rejectionReason}`,
    relatedEntity: { entityType: 'Application', entityId: application._id },
  });

  return ApiResponse.success(res, 200, 'Applicant rejected', application);
});

const createSelectionRound = asyncHandler(async (req, res) => {
  const round = await SelectionRound.create(req.body);
  return ApiResponse.success(res, 201, 'Selection round created', round);
});

const scheduleInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.create(req.body);

  for (const candidate of interview.candidates) {
    const app = await Application.findById(candidate.application).populate({ path: 'student', populate: { path: 'user' } });
    if (app) {
      app.status = 'interview_scheduled';
      await app.save();
      await createNotification({
        userId: app.student.user._id,
        type: 'interview',
        title: 'Interview Scheduled',
        message: `Your ${interview.type} interview is scheduled for ${new Date(interview.scheduledAt).toLocaleString()}`,
        relatedEntity: { entityType: 'Interview', entityId: interview._id },
      });
    }
  }

  return ApiResponse.success(res, 201, 'Interview scheduled', interview);
});

const recordInterviewResult = asyncHandler(async (req, res) => {
  const { applicationId, attendance, result, score, remarks } = req.body;
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError('Interview not found', 404);

  const candidate = interview.candidates.find((c) => c.application.toString() === applicationId);
  if (!candidate) throw new AppError('Candidate not found in interview', 404);

  candidate.attendance = attendance || candidate.attendance;
  candidate.result = result || candidate.result;
  candidate.score = score ?? candidate.score;
  candidate.remarks = remarks || candidate.remarks;
  await interview.save();

  const application = await Application.findById(applicationId).populate({ path: 'student', populate: { path: 'user' } });
  if (application) {
    if (result === 'pass') {
      application.status = interview.type === 'hr' ? 'selected' : `${interview.type}_interview`;
    } else if (result === 'fail') {
      application.status = 'rejected';
    }
    await application.save();

    await createNotification({
      userId: application.student.user._id,
      type: 'result',
      title: 'Interview Result',
      message: `Your interview result: ${result}`,
      relatedEntity: { entityType: 'Interview', entityId: interview._id },
    });
  }

  return ApiResponse.success(res, 200, 'Interview result recorded', interview);
});

const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.create(req.body);
  return ApiResponse.success(res, 201, 'Assessment created', assessment);
});

const addQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({ ...req.body, assessment: req.params.assessmentId });
  return ApiResponse.success(res, 201, 'Question added', question);
});

const updateCompany = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ user: req.user._id });
  const company = await Company.findByIdAndUpdate(recruiter.company, req.body, { new: true, runValidators: true });
  return ApiResponse.success(res, 200, 'Company updated', company);
});

module.exports = {
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
};
