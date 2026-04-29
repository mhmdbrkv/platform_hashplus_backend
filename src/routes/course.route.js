import express from "express";
const router = express.Router({ mergeParams: true });

import {
  getOneModule,
  addCourseModule,
  updateOneCourseModule,
  removeOneCourseModule,
  answerCourseModule,
  getCourseModuleAnswers,
} from "../controllers/course.controller.js";
import { completeFinalProject } from "../controllers/content.controller.js";

import {
  nestedModuleParamsSchema,
  addCourseModuleSchema,
  updateOneCourseModuleSchema,
  answerCourseModuleSchema,
} from "../validators/course.validator.js";
import { completeFinalProjectSchema } from "../validators/content.validator.js";

import validate from "../middleware/validate.middleware.js";
import { checkSubscription } from "../middleware/subscription.middleware.js";
import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard);

// ---------------------- Modules Routes ----------------------
router.get(
  "/modules/:moduleId",
  validate(nestedModuleParamsSchema),
  checkSubscription,
  getOneModule,
);

// ---------------------- Course Answers Routes ----------------------
router.get(
  "/modules/:moduleId/answers",
  validate(nestedModuleParamsSchema),
  allowedTo("student"),
  checkSubscription,
  getCourseModuleAnswers,
);

router.patch(
  "/modules/:moduleId/answers",
  validate(answerCourseModuleSchema),
  allowedTo("student"),
  checkSubscription,
  answerCourseModule,
);

router.patch(
  "/final-project",
  allowedTo("student"),
  validate(completeFinalProjectSchema),
  checkSubscription,
  completeFinalProject,
);
// ----------------------------------------

router.use(allowedTo("admin", "instructor"));

router.post("/modules", validate(addCourseModuleSchema), addCourseModule);
router.patch(
  "/modules/:moduleId",
  validate(updateOneCourseModuleSchema),
  updateOneCourseModule,
);
router.delete(
  "/modules/:moduleId",
  validate(nestedModuleParamsSchema),
  removeOneCourseModule,
);

export default router;
