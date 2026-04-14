import express from "express";
const router = express.Router();

import {
  getAllUsers,
  toggleUserIsActive,
  createStudent,
  getAllStudents,
  getStudentById,
} from "../controllers/dashboard.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard, allowedTo("admin"));

// Users (students, instructors, admins)
router.get("/all-users", getAllUsers);
router.patch("/toggle-user-active/:userId", toggleUserIsActive);

// Students
router.post("/students", createStudent);
router.get("/students", getAllStudents);
router.get("/students/:studentId", getStudentById);

export default router;
