import express from "express";

import {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  completeFinalProject,
} from "../controllers/content.controller.js";

import { guard, allowedTo } from "../middleware/auth.middleware.js";
import reviewRoute from "./review.route.js";
import moduleRoute from "./module.route.js";

import {
  checkSubscription,
  checkBootCampSubscription,
} from "../middleware/subscription.middleware.js";

const router = express.Router({ mergeParams: true });

//Nested Route
router.use("/:contentId/reviews", reviewRoute);
router.use("/:contentId/modules", moduleRoute);

router.get("/", getContents);
router.get("/:contentId", getContent);

router.use(guard);

router.post("/", allowedTo("admin", "instructor"), createContent);
router.patch("/:contentId", allowedTo("admin", "instructor"), updateContent);
router.delete("/:contentId", allowedTo("admin", "instructor"), deleteContent);

router.patch(
  "/:contentId/final-project/course",
  allowedTo("user"),
  checkSubscription,
  completeFinalProject,
);
router.patch(
  "/:contentId/final-project/bootcamp",
  allowedTo("user"),
  checkBootCampSubscription,
  completeFinalProject,
);

export default router;
