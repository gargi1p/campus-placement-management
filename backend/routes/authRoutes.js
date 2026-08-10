const express = require("express");
const {
  signup,
  login,
  changePassword,
  getMe,
  logout,
} = require("../controllers/authController");
const {
  signupValidator,
  loginValidator,
} = require("../validators/authValidator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", authLimiter, signupValidator, validate, signup);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/change-password", protect, authLimiter, changePassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
