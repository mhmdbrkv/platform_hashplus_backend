import express from "express";
const router = express.Router({ mergeParams: true });

import {
  getMyModuleForInstructor,
  getOneModule,
  addCourseModule,
  updateOneCourseModule,
  removeOneCourseModule,
  addBootcampModule,
  updateOneBootcampModule,
  removeOneBootcampModule,
  answerCourseModule,
  getCourseModuleAnswers,
} from "../controllers/module.controller.js";

import {
  checkSubscription,
  checkBootCampSubscription,
} from "../middleware/subscription.middleware.js";
import { guard, allowedTo } from "../middleware/auth.middleware.js";

import {
  nestedModuleParamsSchema,
  addCourseModuleSchema,
  updateOneCourseModuleSchema,
  addBootcampModuleSchema,
  updateOneBootcampModuleSchema,
  answerCourseModuleSchema,
} from "../validators/module.validator.js";
import validate from "../middleware/validate.middleware.js";

router.use(guard);

router.get(
  "/:moduleId/instructor",
  validate(nestedModuleParamsSchema),
  allowedTo("instructor"),
  getMyModuleForInstructor,
); // Get My Module For Instructor (Private)
router.get("/:moduleId", validate(nestedModuleParamsSchema), getOneModule); // One Module Route (Public) For development
router.get(
  "/:moduleId/course",
  validate(nestedModuleParamsSchema),
  checkSubscription,
  getOneModule,
); // Course Modules Route (Private)
router.get(
  "/:moduleId/bootcamp",
  validate(nestedModuleParamsSchema),
  checkBootCampSubscription,
  getOneModule,
); // Bootcamp Modules Route (Private)

// ------- Course Answer Module Routes -------
router.get(
  "/:moduleId/course-answer",
  validate(nestedModuleParamsSchema),
  allowedTo("student"),
  checkSubscription,
  getCourseModuleAnswers,
);

router.patch(
  "/:moduleId/course-answer",
  validate(answerCourseModuleSchema),
  allowedTo("student"),
  checkSubscription,
  answerCourseModule,
);
// ----------------------------------------

router.use(allowedTo("admin", "instructor"));

// Course Modules Routes
router.post("/course", validate(addCourseModuleSchema), addCourseModule);
router.patch(
  "/:moduleId/course",
  validate(updateOneCourseModuleSchema),
  updateOneCourseModule,
);
router.delete(
  "/:moduleId/course",
  validate(nestedModuleParamsSchema),
  removeOneCourseModule,
);

// Bootcamp Modules Routes
router.post("/bootcamp", validate(addBootcampModuleSchema), addBootcampModule);
router.patch(
  "/:moduleId/bootcamp",
  validate(updateOneBootcampModuleSchema),
  updateOneBootcampModule,
);
router.delete(
  "/:moduleId/bootcamp",
  validate(nestedModuleParamsSchema),
  removeOneBootcampModule,
);

export default router;
