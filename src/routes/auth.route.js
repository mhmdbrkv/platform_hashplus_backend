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

router.post("/signup", otpLimiter, validate(signupSchema), signup);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/verify-otp", otpLimiter, validate(otpSchema), verifyOtp);
router.post("/request-otp", otpLimiter, requestOtp);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/google", loginLimiter, googleAuth);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/verify-reset-code",
  passwordResetLimiter,
  validate(verifyResetCodeSchema),
  verifyResetCode,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
