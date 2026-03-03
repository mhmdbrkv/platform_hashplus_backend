import express from "express";

import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

// import contentRoute from "./content.route.js";
import { guard } from "../middleware/auth.middleware.js";

const router = express.Router();

//Nested Route
// router.use("/:categoryId/content", contentRoute);

router.get("/", getCategories);
router.get("/:id", getCategory);

router.use(guard);

router.post("/", createCategory);
router.route("/:id").put(updateCategory).delete(deleteCategory);

export default router;
