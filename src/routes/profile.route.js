import express from "express";
const router = express.Router();

import {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  changePassword,

  // uploadMyProfileImage,
  // deleteMyProfileImage,
  // getMyProfileImage,
} from "../controllers/profile.controller.js";

import { guard } from "../middleware/auth.middleware.js";

router.use(guard);

// Logged in User Profile routes
router.get("/", getMyProfile);
router.delete("/", deleteMyProfile);
router.patch("/", updateMyProfile);
router.patch("/change-password", changePassword);

// router.get("/profileImage", getMyProfileImage);
// router.patch("/profileImage", imageUpload, uploadMyProfileImage);
// router.delete("/profileImage", deleteMyProfileImage);

export default router;
