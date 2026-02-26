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

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/request-otp", requestOtp);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
