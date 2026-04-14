import express from "express";
const router = express.Router();

import {
  getAllUsers,
  toggleUserIsActive,
  createUser,
  getUserById,
} from "../controllers/dashboard.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard, allowedTo("admin"));

// Users
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.patch("/users/:userId/active", toggleUserIsActive);

export default router;
