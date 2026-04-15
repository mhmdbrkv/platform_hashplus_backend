import express from "express";
const router = express.Router();

import {
  getMyLearning,
  addToMyLearning,
  removeFromMyLearning,
  updateProgress,
} from "../controllers/learning.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";
import { checkSubscription } from "../middleware/subscription.middleware.js";

router.use(guard, allowedTo("student"));

router.get("/", getMyLearning);
router.post("/:contentId", checkSubscription, addToMyLearning);
router.delete("/:contentId", checkSubscription, removeFromMyLearning);
router.patch("/:contentId/progress", checkSubscription, updateProgress);

export default router;
