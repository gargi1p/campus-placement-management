const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Recruiter = require("../models/Recruiter");
const { generateRandomToken, hashToken } = require("../utils/crypto");
const { sendTokenResponse } = require("../utils/generateToken");

const { logActivity } = require("../services/auditService");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../middleware/errorHandler");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyId, rollNumber } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already registered", 400);

  const user = await User.create({
    name,
    email,
    password,
    role,
    isVerified: true,
  });

  if (role === "student") {
    await StudentProfile.create({ user: user._id, rollNumber });
  } else if (role === "recruiter") {
    if (!companyId)
      throw new AppError("Company ID required for recruiter signup", 400);
    await Recruiter.create({ user: user._id, company: companyId });
  }

  await logActivity({
    userId: user._id,
    action: "SIGNUP",
    entity: "User",
    entityId: user._id,
    req,
  });

  sendTokenResponse(user, 201, res, "Account created successfully");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) throw new AppError("Account deactivated", 403);

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await logActivity({
    userId: user._id,
    action: "LOGIN",
    entity: "User",
    entityId: user._id,
    req,
  });

  sendTokenResponse(user, 200, res, "Login successful");
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError("Old password is incorrect", 400);

  user.password = newPassword;
  await user.save();

  await logActivity({
    userId: user._id,
    action: "PASSWORD_CHANGE",
    entity: "User",
    entityId: user._id,
    req,
  });

  return ApiResponse.success(res, 200, "Password changed successfully");
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  let profile = null;

  if (user.role === "student") {
    profile = await StudentProfile.findOne({ user: user._id }).populate(
      "department resume",
    );
  } else if (user.role === "recruiter") {
    profile = await Recruiter.findOne({ user: user._id }).populate("company");
  }

  return ApiResponse.success(res, 200, "Profile fetched", { user, profile });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  return ApiResponse.success(res, 200, "Logged out successfully");
});

module.exports = {
  signup,
  login,
  changePassword,
  getMe,
  logout,
};
