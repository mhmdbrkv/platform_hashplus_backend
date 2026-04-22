import express from "express";

import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/review.validator.js";
import {
  mongoIdSchema,
  paginationSchema,
} from "../validators/common.validator.js";
import validate from "../middleware/validate.middleware.js";

import { guard } from "../middleware/auth.middleware.js";
import { checkSubscription } from "../middleware/subscription.middleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", validate(paginationSchema), getReviews);
router.get("/:reviewId", validate(mongoIdSchema("reviewId")), getReview);

router.use(guard);

// development routes
router.route("/").post(validate(createReviewSchema), createReview);
router
  .route("/:reviewId")
  .patch(validate(updateReviewSchema), updateReview)
  .delete(validate(mongoIdSchema("reviewId")), deleteReview);

// production routes
// router
//   .route("/")
//   .post(validate(createReviewSchema), checkSubscription, createReview);
// router
//   .route("/:reviewId")
//   .patch(validate(updateReviewSchema), checkSubscription, updateReview)
//   .delete(validate(mongoIdSchema("reviewId")), checkSubscription, deleteReview);

export default router;
