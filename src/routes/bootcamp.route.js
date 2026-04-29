import express from "express";
const router = express.Router({ mergeParams: true });

import {
  // Sections
  getOneBootcampSection,
  getAllBootcampSections,
  addBootcampSection,
  updateOneBootcampSection,
  removeOneBootcampSection,

  // Modules
  getOneBootcampModule,
  getAllBootcampModules,
  addBootcampModule,
  updateOneBootcampModule,
  removeOneBootcampModule,
} from "../controllers/bootcamp.controller.js";
import { completeFinalProject } from "../controllers/content.controller.js";

import {
  sectionAndModuleParamsSchema,
  addBootcampModuleSchema,
  updateOneBootcampModuleSchema,
  addBootcampSectionSchema,
  updateOneBootcampSectionSchema,
} from "../validators/bootcamp.validator.js";
import { mongoIdSchema } from "../validators/common.validator.js";
import { completeFinalProjectSchema } from "../validators/content.validator.js";

import validate from "../middleware/validate.middleware.js";
import { checkBootCampSubscription } from "../middleware/subscription.middleware.js";
import { guard, allowedTo } from "../middleware/auth.middleware.js";

router.use(guard);

// ---------------------- Sections Routes ----------------------
router.get("/sections", getAllBootcampSections);
router.get(
  "/sections/:sectionId",
  validate(mongoIdSchema("sectionId")),
  getOneBootcampSection,
);

// ---------------------- Modules ----------------------
router.get(
  "/sections/:sectionId/modules",
  validate(mongoIdSchema("sectionId")),
  // checkBootCampSubscription,
  getAllBootcampModules,
);

router.get(
  "/sections/:sectionId/modules/:moduleId",
  validate(sectionAndModuleParamsSchema),
  // checkBootCampSubscription,
  getOneBootcampModule,
);

// ---------------------- Final Project ----------------------
router.patch(
  "/final-project",
  allowedTo("student"),
  validate(completeFinalProjectSchema),
  checkBootCampSubscription,
  completeFinalProject,
);

router.use(allowedTo("admin", "instructor"));

// ---------------------- Sections ----------------------
router.post(
  "/sections",
  validate(addBootcampSectionSchema),
  addBootcampSection,
);

router.patch(
  "/sections/:sectionId",
  validate(updateOneBootcampSectionSchema),
  updateOneBootcampSection,
);

router.delete(
  "/sections/:sectionId",
  validate(mongoIdSchema("sectionId")),
  removeOneBootcampSection,
);

// ---------------------- Modules ----------------------
router.post(
  "/sections/:sectionId/modules",
  validate(addBootcampModuleSchema),
  addBootcampModule,
);

router.patch(
  "/sections/:sectionId/modules/:moduleId",
  validate(updateOneBootcampModuleSchema),
  updateOneBootcampModule,
);

router.delete(
  "/sections/:sectionId/modules/:moduleId",
  validate(sectionAndModuleParamsSchema),
  removeOneBootcampModule,
);

export default router;
