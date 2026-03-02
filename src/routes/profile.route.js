import express from "express";
const router = express.Router();

import {
  getMyProfile,
  // getAllProfiles,
  updateMyProfile,
  // deleteMyProfile,
  // uploadMyProfileImage,
  // deleteMyProfileImage,
  // toggleUserIsActive,
  // getMyProfileImage,
  changePassword,
} from "../controllers/profile.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard);

// Logged in User Profile routes
router.get("/", getMyProfile);
// router.delete("/", deleteMyProfile);
router.patch("/", updateMyProfile);
// router.get("/profileImage", getMyProfileImage);
// router.patch("/profileImage", imageUpload, uploadMyProfileImage);
// router.delete("/profileImage", deleteMyProfileImage);
router.patch("/change-password", changePassword);

// Admin Only Routes
// router.use(allowedTo("admin"));
// router.get("/all", getAllProfiles);
// router.patch("/isActive/:userId", toggleUserIsActive);

export default router;
