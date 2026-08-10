const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const JobDrive = require('../models/JobDrive');
const { checkEligibility } = require('../services/eligibilityService');
const { createNotification } = require('../services/notificationService');
const { logActivity } = require('../services/auditService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { buildPagination } = require('../utils/pagination');

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id })
    .populate('department')
    .populate('resume');
  if (!profile) throw new AppError('Student profile not found', 404);
  return ApiResponse.success(res, 200, 'Profile fetched', profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  let profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Student profile not found', 404);

  Object.assign(profile, req.body);
  profile.calculateProfileCompletion();
  await profile.save();

  await logActivity({ userId: req.user._id, action: 'UPDATE_PROFILE', entity: 'StudentProfile', entityId: profile._id, req });

  return ApiResponse.success(res, 200, 'Profile updated', profile);
});

const getEligibleDrives = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Student profile not found', 404);

  const drives = await JobDrive.find({ status: 'published', applicationDeadline: { $gte: new Date() } })
    .populate('company', 'name logo industry')
    .sort('-createdAt');

  const results = drives.map((drive) => ({
    drive,
    eligibility: checkEligibility(profile, drive.eligibilityCriteria),
  }));

  return ApiResponse.success(res, 200, 'Eligible drives fetched', results);
});

const checkDriveEligibility = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const drive = await JobDrive.findById(req.params.driveId);
  if (!profile || !drive) throw new AppError('Profile or drive not found', 404);

  const eligibility = checkEligibility(profile, drive.eligibilityCriteria);
  return ApiResponse.success(res, 200, 'Eligibility checked', eligibility);
});

const applyToDrive = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  const drive = await JobDrive.findById(req.params.driveId);

  if (!profile || !drive) throw new AppError('Profile or drive not found', 404);
  if (drive.status !== 'published') throw new AppError('Drive is not open for applications', 400);
  if (drive.applicationDeadline < new Date()) throw new AppError('Application deadline has passed', 400);

  const eligibility = checkEligibility(profile, drive.eligibilityCriteria);
  if (!eligibility.isEligible) {
    throw new AppError('Not eligible for this drive', 403);
  }

  const existing = await Application.findOne({ student: profile._id, jobDrive: drive._id });
  if (existing) throw new AppError('Already applied to this drive', 400);

  const application = await Application.create({
    student: profile._id,
    jobDrive: drive._id,
    eligibility,
    status: 'applied',
  });

  profile.placementStatus = 'applied';
  await profile.save();

  await createNotification({
    userId: req.user._id,
    type: 'drive',
    title: 'Application Submitted',
    message: `Your application for ${drive.title} at ${drive.company} has been submitted.`,
    relatedEntity: { entityType: 'Application', entityId: application._id },
  });

  return ApiResponse.success(res, 201, 'Application submitted', application);
});

const getMyApplications = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (!profile) throw new AppError('Student profile not found', 404);

  const { page = 1, limit = 10, status } = req.query;
  const filter = { student: profile._id };
  if (status) filter.status = status;

  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate({ path: 'jobDrive', populate: { path: 'company', select: 'name logo' } })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Applications fetched', applications, buildPagination(page, limit, total));
});

const getPublishedDrives = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = { status: 'published', applicationDeadline: { $gte: new Date() } };
  if (search) filter.$text = { $search: search };

  const total = await JobDrive.countDocuments(filter);
  const drives = await JobDrive.find(filter)
    .populate('company', 'name logo industry location')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Drives fetched', drives, buildPagination(page, limit, total));
});

module.exports = {
  getMyProfile,
  updateProfile,
  getEligibleDrives,
  checkDriveEligibility,
  applyToDrive,
  getMyApplications,
  getPublishedDrives,
};
