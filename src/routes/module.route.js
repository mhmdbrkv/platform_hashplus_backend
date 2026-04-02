import express from "express";

import {
  getOneModule,
  addCourseModule,
  updateOneCourseModule,
  removeOneCourseModule,
  addBootcampModule,
  updateOneBootcampModule,
  removeOneBootcampModule,
} from "../controllers/module.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/:id", getOneModule);

router.use(guard, allowedTo("admin", "instructor"));

// Course Modules Routes
router.post("/course", addCourseModule);
router.patch("/:id/course", updateOneCourseModule);
router.delete("/:id/course", removeOneCourseModule);

// Bootcamp Modules Routes
router.post("/bootcamp", addBootcampModule);
router.patch("/:id/bootcamp", updateOneBootcampModule);
router.delete("/:id/bootcamp", removeOneBootcampModule);

export default router;
