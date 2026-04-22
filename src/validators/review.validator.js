import { z } from "zod";
import mongoose from "mongoose";

const trimString = (schema) =>
  schema
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "Required");

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const createReviewSchema = z.object({
  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5),
      review: trimString(z.string().min(5).max(1000)),
      content: isObjectId(z.string(), "content"),
    })
    .strict(),
});

export const updateReviewSchema = z.object({
  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5).optional(),
      review: trimString(z.string().min(5).max(1000)).optional(),
    })
    .optional(),
  params: z
    .object({
      reviewId: isObjectId(z.string(), "reviewId"),
    })
    .strict(),
});
