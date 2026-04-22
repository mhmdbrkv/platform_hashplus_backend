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

import validate from "../middleware/validator.middleware.js";
import { mongoIdSchema } from "../validators/common.validator.js";
import {
  addToMyLearningSchemam,
  updateProgressSchema,
} from "../validators/learning.validator.js";

router.use(guard, allowedTo("student"));

// development routes
router.get("/", getMyLearning);
router.post("/", validate(addToMyLearningSchemam), addToMyLearning);

router.delete(
  "/:contentId",
  validate(mongoIdSchema("contentId")),
  removeFromMyLearning,
);

router.patch(
  "/:contentId/progress",
  validate(updateProgressSchema),
  updateProgress,
);

// production routes
// router.post("/:contentId", checkSubscription, addToMyLearning);
// router.delete("/:contentId", checkSubscription, removeFromMyLearning);
// router.patch("/:contentId/progress", checkSubscription, updateProgress);

export default router;
