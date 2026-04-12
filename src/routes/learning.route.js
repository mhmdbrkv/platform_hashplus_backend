import express from "express";
const router = express.Router();

import {
  getMyLearning,
  addToMyLearning,
  removeFromMyLearning,
  updateProgress,
} from "../controllers/learning.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard, allowedTo("user"));

router.get("/", getMyLearning);
router.post("/:contentId", addToMyLearning);
router.delete("/:contentId", removeFromMyLearning);
router.patch("/:contentId/progress", updateProgress);

export default router;
