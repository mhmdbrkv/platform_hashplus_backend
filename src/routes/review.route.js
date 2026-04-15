import express from "express";

import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import { guard } from "../middleware/auth.middleware.js";
import { checkSubscription } from "../middleware/subscription.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", getReviews);
router.get("/:id", getReview);

router.use(guard);

router.route("/").post(checkSubscription, createReview);
router
  .route("/:id")
  .put(checkSubscription, updateReview)
  .delete(checkSubscription, deleteReview);

export default router;
