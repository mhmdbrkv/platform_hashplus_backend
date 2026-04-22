import { z } from "zod";
import mongoose from "mongoose";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    review: z.string().min(5).max(1000),
    content: z.custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error(`content must be a valid MongoDB ID`);
      }
      return value;
    }),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    review: z.string().min(5).max(1000).optional(),
  }),
  params: z.object({
    reviewId: z.custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error(`reviewId must be a valid MongoDB ID`);
      }
      return value;
    }),
  }),
});
