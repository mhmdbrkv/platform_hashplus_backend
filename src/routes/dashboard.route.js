import express from "express";
const router = express.Router();

import {
  getAllUsers,
  toggleUserIsActive,
  createUser,
  getUserById,
  getAllContent,
  getContentById,
} from "../controllers/dashboard.controller.js";
import { createContent } from "../controllers/content.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard, allowedTo("admin"));

// Users
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.patch("/users/:userId/active", toggleUserIsActive);

// Content
router.post("/content", createContent);
router.get("/content", getAllContent);
router.get("/content/:contentId", getContentById);

export default router;
