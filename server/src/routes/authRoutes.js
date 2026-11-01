const express = require("express");

const {
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  login,
  getMe,
  logout,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Registration and email verification
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Authentication
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;