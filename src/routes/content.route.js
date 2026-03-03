import express from "express";

import {
  getContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
} from "../controllers/content.controller.js";

import { guard } from "../middleware/auth.middleware.js";
import reviewRoute from "./review.route.js";

const router = express.Router({ mergeParams: true });

//Nested Route
router.use("/:contentId/reviews", reviewRoute);

router.get("/", getContents);
router.get("/:id", getContent);

router.use(guard);

router.post("/", createContent);
router.route("/:id").put(updateContent).delete(deleteContent);

export default router;
