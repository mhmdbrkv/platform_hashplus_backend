import express from "express";
const router = express.Router({ mergeParams: true });

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
  completeFinalProject,
);
router.patch(
  "/:contentId/final-project/bootcamp",
  allowedTo("student"),
  validate(completeFinalProjectSchema),
  completeFinalProject,
);

// production ready
// router.patch(
//   "/:contentId/final-project/course",
//   allowedTo("student"),
//   validate(completeFinalProjectSchema),
//   checkSubscription,
//   completeFinalProject,
// );
// router.patch(
//   "/:contentId/final-project/bootcamp",
//   allowedTo("student"),
//   validate(completeFinalProjectSchema),
//   checkBootCampSubscription,
//   completeFinalProject,
// );

export default router;
