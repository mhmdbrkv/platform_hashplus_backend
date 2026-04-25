import { z } from "zod";
import mongoose from "mongoose";

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const createReviewSchema = z.object({
  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5),
      review: z.string().trim().min(5).max(1000),
      content: isObjectId(z.string(), "content"),
    })
    .strict(),
});

export const updateReviewSchema = z.object({
  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5),
      review: z.string().trim().min(5).max(1000),
    })
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required",
    ),

  params: z
    .object({
      reviewId: isObjectId(z.string(), "reviewId"),
    })
    .strict(),
});
