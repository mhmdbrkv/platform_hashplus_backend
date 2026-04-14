import express from "express";

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
const router = express.Router({ mergeParams: true });

router.use(guard);

router.get(
  "/:moduleId/instructor",
  allowedTo("instructor"),
  getMyModuleForInstructor,
); // Get My Module For Instructor (Private)
router.get("/:moduleId", getOneModule); // One Module Route (Public) For development
router.get("/:moduleId/course", checkSubscription, getOneModule); // Course Modules Route (Private)
router.get("/:moduleId/bootcamp", checkBootCampSubscription, getOneModule); // Bootcamp Modules Route (Private)

// Course Answer Module Routes
router.patch(
  "/:moduleId/course-answer",
  allowedTo("user"),
  checkSubscription,
  answerCourseModule,
);

router.get(
  "/:moduleId/course-answer",
  allowedTo("user"),
  checkSubscription,
  getCourseModuleAnswers,
);

router.use(allowedTo("admin", "instructor"));

// Course Modules Routes
router.post("/course", addCourseModule);
router.patch("/:moduleId/course", updateOneCourseModule);
router.delete("/:moduleId/course", removeOneCourseModule);

// Bootcamp Modules Routes
router.post("/bootcamp", addBootcampModule);
router.patch("/:moduleId/bootcamp", updateOneBootcampModule);
router.delete("/:moduleId/bootcamp", removeOneBootcampModule);

export default router;
