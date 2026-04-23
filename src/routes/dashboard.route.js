import express from "express";
const router = express.Router();

import {
  getAllUsers,
  toggleUserIsActive,
  createUser,
  getUserById,
  getAllContent,
  getContentById,
  getDashboardStats,
  getDashboardAnalytics,
} from "../controllers/dashboard.controller.js";
import { createContent } from "../controllers/content.controller.js";

import {
  createUserSchema,
  createContentSchema,
} from "../validators/dashboard.validator.js";
import {
  mongoIdSchema,
  paginationSchema,
} from "../validators/common.validator.js";
import validate from "../middleware/validate.middleware.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard, allowedTo("admin"));

// Dashboard
router.get("/", getDashboardStats);
router.get("/analytics", getDashboardAnalytics);

// Users
router.post("/users", validate(createUserSchema), createUser);
router.get("/users", validate(paginationSchema), getAllUsers);
router.get("/users/:userId", validate(mongoIdSchema("userId")), getUserById);
router.patch(
  "/users/:userId/active",
  validate(mongoIdSchema("userId")),
  toggleUserIsActive,
);

// Content
router.post("/content", validate(createContentSchema), createContent);
router.get("/content", validate(paginationSchema), getAllContent);
router.get(
  "/content/:contentId",
  validate(mongoIdSchema("contentId")),
  getContentById,
);

export default router;
