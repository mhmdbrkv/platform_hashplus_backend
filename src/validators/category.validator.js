import { z } from "zod";

const trimString = (schema) =>
  schema
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "Required");

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const createCategorySchema = z.object({
  body: z
    .object({
      name: trimString(z.string().min(2).max(50)),
    })
    .strict(),
});

export const updateCategorySchema = z.object({
  body: z
    .object({
      name: trimString(z.string().min(2).max(50)),
    })
    .optional(),
  params: z
    .object({
      categoryId: isObjectId(z.string(), "categoryId"),
    })
    .strict(),
});
