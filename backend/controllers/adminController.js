const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Recruiter = require('../models/Recruiter');
const Company = require('../models/Company');
const Department = require('../models/Department');
const JobDrive = require('../models/JobDrive');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Assessment = require('../models/Assessment');
const Offer = require('../models/Offer');
const Document = require('../models/Document');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const { logActivity } = require('../services/auditService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { buildPagination, buildSearchQuery } = require('../utils/pagination');

const createAdmin = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, role: 'admin', isVerified: true });
  return ApiResponse.success(res, 201, 'Admin created', { id: user._id, name: user.name, email: user.email });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) Object.assign(filter, buildSearchQuery(search, ['name', 'email']));

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Users fetched', users, buildPagination(page, limit, total));
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  user.isActive = !user.isActive;
  await user.save();
  await logActivity({ userId: req.user._id, action: 'TOGGLE_USER', entity: 'User', entityId: user._id, changes: { isActive: user.isActive }, req });
  return ApiResponse.success(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
});

const getAllStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, branch, placementStatus } = req.query;
  const filter = {};
  if (branch) filter.branch = branch;
  if (placementStatus) filter.placementStatus = placementStatus;

  const total = await StudentProfile.countDocuments(filter);
  const students = await StudentProfile.find(filter)
    .populate('user', 'name email isVerified isActive')
    .populate('department')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Students fetched', students, buildPagination(page, limit, total));
});

const getAllRecruiters = asyncHandler(async (req, res) => {
  const recruiters = await Recruiter.find()
    .populate('user', 'name email isVerified isActive')
    .populate('company');
  return ApiResponse.success(res, 200, 'Recruiters fetched', recruiters);
});

const approveRecruiter = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!recruiter) throw new AppError('Recruiter not found', 404);
  return ApiResponse.success(res, 200, 'Recruiter approved', recruiter);
});

const createDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  return ApiResponse.success(res, 201, 'Department created', dept);
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort('name');
  return ApiResponse.success(res, 200, 'Departments fetched', departments);
});

const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create(req.body);
  return ApiResponse.success(res, 201, 'Company created', company);
});

const getCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const filter = { isActive: true };
  if (search) filter.$text = { $search: search };

  const total = await Company.countDocuments(filter);
  const companies = await Company.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Companies fetched', companies, buildPagination(page, limit, total));
});

const getAllDrives = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const total = await JobDrive.countDocuments(filter);
  const drives = await JobDrive.find(filter)
    .populate('company recruiter')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Drives fetched', drives, buildPagination(page, limit, total));
});

const getAllApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate({ path: 'jobDrive', populate: { path: 'company', select: 'name' } })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  return ApiResponse.success(res, 200, 'Applications fetched', applications, buildPagination(page, limit, total));
});

const getAllInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find().populate('jobDrive').sort('-scheduledAt');
  return ApiResponse.success(res, 200, 'Interviews fetched', interviews);
});

const getAllAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find().populate('jobDrive').sort('-createdAt');
  return ApiResponse.success(res, 200, 'Assessments fetched', assessments);
});

const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find()
    .populate('student company jobDrive')
    .sort('-createdAt');
  return ApiResponse.success(res, 200, 'Offers fetched', offers);
});

const getAllDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find().populate('user', 'name email role').sort('-createdAt');
  return ApiResponse.success(res, 200, 'Documents fetched', documents);
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, author: req.user._id });
  return ApiResponse.success(res, 201, 'Announcement created', announcement);
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ isActive: true })
    .populate('author', 'name')
    .sort('-createdAt');
  return ApiResponse.success(res, 200, 'Announcements fetched', announcements);
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .populate('user', 'name email role')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));
  return ApiResponse.success(res, 200, 'Audit logs fetched', logs, buildPagination(page, limit, total));
});

module.exports = {
  createAdmin,
  getAllUsers,
  toggleUserStatus,
  getAllStudents,
  getAllRecruiters,
  approveRecruiter,
  createDepartment,
  getDepartments,
  createCompany,
  getCompanies,
  getAllDrives,
  getAllApplications,
  getAllInterviews,
  getAllAssessments,
  getAllOffers,
  getAllDocuments,
  createAnnouncement,
  getAnnouncements,
  getAuditLogs,
};
