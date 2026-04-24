import express from "express";
const router = express.Router();
import { NODE_ENV } from "../config/env.js";

import {
  getMyLearning,
  addToMyLearning,
  removeFromMyLearning,
  updateProgress,
} from "../controllers/learning.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";
import { checkSubscription } from "../middleware/subscription.middleware.js";

import validate from "../middleware/validate.middleware.js";
import { mongoIdSchema } from "../validators/common.validator.js";
import { updateProgressSchema } from "../validators/learning.validator.js";

const subCheck = NODE_ENV === "production" ? [checkSubscription] : [];

router.use(guard, allowedTo("student"));

// development routes
router.get("/", getMyLearning);

// production routes
router.post(
  "/:contentId",
  validate(mongoIdSchema("contentId")),
  ...subCheck,
  addToMyLearning,
);
router.delete(
  "/:contentId",
  validate(mongoIdSchema("contentId")),
  ...subCheck,
  removeFromMyLearning,
);
router.patch(
  "/:contentId/progress",
  validate(updateProgressSchema),
  ...subCheck,
  updateProgress,
);

export default router;
