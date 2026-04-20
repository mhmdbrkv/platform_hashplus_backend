import express from "express";
const router = express.Router();

import validate from "../middleware/validate.middleware.js";
import {
  signupSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

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

router.post("/signup", otpLimiter, validate(signupSchema), signup);
router.post("/verify-otp", otpLimiter, validate(otpSchema), verifyOtp);
router.post("/request-otp", otpLimiter, requestOtp);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/google", loginLimiter, googleAuth);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/verify-reset-code",
  passwordResetLimiter,
  validate(otpSchema),
  verifyResetCode,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
