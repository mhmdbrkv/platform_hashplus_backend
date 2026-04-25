import mongoose from "mongoose";
import { z } from "zod";

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const createCategorySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(50),
    })
    .strict(),
});

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(50),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required",
    ),
  params: z
    .object({
      categoryId: isObjectId(z.string(), "categoryId"),
    })
    .strict(),
});
