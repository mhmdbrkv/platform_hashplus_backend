import express from "express";

import {
  getOneModule,
  addCourseModule,
  updateOneCourseModule,
  removeOneCourseModule,
  // addBootcampModule,
  // updateOneBootcampModule,
  // removeOneBootcampModule,
} from "../controllers/module.controller.js";

import { guard } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(guard);

router.get("/:id", getOneModule);

// Course Modules Routes
router.post("/course", addCourseModule);
router.patch("/:id/course", updateOneCourseModule);
router.delete("/:id/course", removeOneCourseModule);

// Bootcamp Modules Routes
// router.post("/bootcamp", addBootcampModule);
// router.patch("/:id/bootcamp", updateOneBootcampModule);
// router.delete("/:id/bootcamp", removeOneBootcampModule);

export default router;
