import express from "express";
const router = express.Router({ mergeParams: true });
import { NODE_ENV } from "../config/env.js";

import {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  completeFinalProject,
} from "../controllers/content.controller.js";

import {
  checkSubscription,
  checkBootCampSubscription,
} from "../middleware/subscription.middleware.js";

import {
  createContentSchema,
  updateContentSchema,
  completeFinalProjectSchema,
} from "../validators/content.validator.js";

import {
  mongoIdSchema,
  paginationSchema,
} from "../validators/common.validator.js";

import validate from "../middleware/validate.middleware.js";

const subCheck = NODE_ENV === "production" ? [checkSubscription] : [];
const bootcampSubCheck =
  NODE_ENV === "production" ? [checkBootCampSubscription] : [];

import reviewRoute from "./review.route.js";
import moduleRoute from "./module.route.js";
import { guard, allowedTo } from "../middleware/auth.middleware.js";

//Nested Routes
router.use(
  "/:contentId/reviews",
  validate(mongoIdSchema("contentId")),
  reviewRoute,
);
router.use(
  "/:contentId/modules",
  validate(mongoIdSchema("contentId")),
  moduleRoute,
);

router.get("/", validate(paginationSchema), getContents);
router.get("/:contentId", validate(mongoIdSchema("contentId")), getContent);

router.use(guard);

router.post(
  "/",
  allowedTo("admin", "instructor"),
  validate(createContentSchema),
  createContent,
);
router.patch(
  "/:contentId",
  allowedTo("admin", "instructor"),
  validate(updateContentSchema),
  updateContent,
);
router.delete(
  "/:contentId",
  allowedTo("admin", "instructor"),
  validate(mongoIdSchema("contentId")),
  deleteContent,
);

router.patch(
  "/:contentId/final-project/course",
  allowedTo("student"),
  validate(completeFinalProjectSchema),
  ...subCheck,
  completeFinalProject,
);
router.patch(
  "/:contentId/final-project/bootcamp",
  allowedTo("student"),
  validate(completeFinalProjectSchema),
  ...bootcampSubCheck,
  completeFinalProject,
);

export default router;
