import express from "express";
const router = express.Router();

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

import {
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimit.middleware.js";

import {
  signupSchema,
  loginSchema,
  otpSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";

import validate from "../middleware/validate.middleware.js";
import { guard } from "../middleware/auth.middleware.js";

router.post("/signup", otpLimiter, validate(signupSchema), signup);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/verify-otp", guard, otpLimiter, validate(otpSchema), verifyOtp);
router.post("/request-otp", guard, otpLimiter, requestOtp);
router.post("/logout", guard, logout);
router.post("/refresh-token", guard, refreshToken);
router.post("/google", loginLimiter, googleAuth);

router.post(
  "/forgot-password",
  guard,
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/verify-reset-code",
  guard,
  passwordResetLimiter,
  validate(verifyResetCodeSchema),
  verifyResetCode,
);
router.post(
  "/reset-password",
  guard,
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
