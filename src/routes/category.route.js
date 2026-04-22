import express from "express";

import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";
import { objectId } from "../validators/common.validator.js";
import validate from "../middleware/validate.middleware.js";

import contentRoute from "./content.route.js";
import { guard, allowedTo } from "../middleware/auth.middleware.js";

const router = express.Router();

//Nested Route
router.use(
  "/:categoryId/contents",
  validate(objectId("categoryId")),
  contentRoute,
);

router.get("/", getCategories);
router.get("/:categoryId", validate(objectId("categoryId")), getCategory);

router.use(guard, allowedTo("admin"));

router.post("/", validate(createCategorySchema), createCategory);
router
  .route("/:categoryId")
  .patch(validate(updateCategorySchema), updateCategory)
  .delete(validate(objectId("categoryId")), deleteCategory);

export default router;
