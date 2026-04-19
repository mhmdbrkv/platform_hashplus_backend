import express from "express";
const router = express.Router();

import {
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimit.middleware.js";

import {
  signup,
  verifyOtp,
  requestOtp,
  login,
  googleAuth,
  logout,
  refreshToken,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth.controller.js";

router.post("/signup", otpLimiter, signup);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/request-otp", otpLimiter, requestOtp);
router.post("/login", loginLimiter, login);
router.post("/google", loginLimiter, googleAuth);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/verify-reset-code", passwordResetLimiter, verifyResetCode);
router.post("/reset-password", passwordResetLimiter, resetPassword);

export default router;
