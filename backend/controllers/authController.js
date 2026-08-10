const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Recruiter = require('../models/Recruiter');
const { generateRandomToken, hashToken } = require('../utils/crypto');
const { sendTokenResponse } = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { logActivity } = require('../services/auditService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyId, rollNumber } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const verificationToken = generateRandomToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashToken(verificationToken),
    verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
  });

  if (role === 'student') {
    await StudentProfile.create({ user: user._id, rollNumber });
  } else if (role === 'recruiter') {
    if (!companyId) throw new AppError('Company ID required for recruiter signup', 400);
    await Recruiter.create({ user: user._id, company: companyId });
  }

  await sendVerificationEmail(user, verificationToken);
  await logActivity({ userId: user._id, action: 'SIGNUP', entity: 'User', entityId: user._id, req });

  sendTokenResponse(user, 201, res, 'Account created. Please verify your email.');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) throw new AppError('Account deactivated', 403);

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await logActivity({ userId: user._id, action: 'LOGIN', entity: 'User', entityId: user._id, req });

  sendTokenResponse(user, 200, res, 'Login successful');
});

const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = hashToken(req.params.token);
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired verification token', 400);

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  return ApiResponse.success(res, 200, 'Email verified successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return ApiResponse.success(res, 200, 'If email exists, reset link has been sent');
  }

  const resetToken = generateRandomToken();
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(user, resetToken);

  return ApiResponse.success(res, 200, 'If email exists, reset link has been sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = hashToken(req.body.token);
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let profile = null;

  if (user.role === 'student') {
    profile = await StudentProfile.findOne({ user: user._id }).populate('department resume');
  } else if (user.role === 'recruiter') {
    profile = await Recruiter.findOne({ user: user._id }).populate('company');
  }

  return ApiResponse.success(res, 200, 'Profile fetched', { user, profile });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  return ApiResponse.success(res, 200, 'Logged out successfully');
});

module.exports = { signup, login, verifyEmail, forgotPassword, resetPassword, getMe, logout };
