import express from "express";

import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { guard } from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", getReviews);
router.get("/:id", getReview);

router.use(guard);

router.route("/").post(createReview);
router.route("/:id").put(updateReview).delete(deleteReview);

export default router;
