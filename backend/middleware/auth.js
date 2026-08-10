const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return ApiResponse.error(res, 401, 'Not authorized. Please login.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return ApiResponse.error(res, 401, 'User not found or deactivated.');
    }

    req.user = user;
    next();
  } catch {
    return ApiResponse.error(res, 401, 'Invalid or expired token.');
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return ApiResponse.error(res, 403, `Role '${req.user.role}' is not authorized.`);
  }
  next();
};

const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return ApiResponse.error(res, 403, 'Please verify your email before accessing this resource.');
  }
  next();
};

module.exports = { protect, authorize, requireVerified };
