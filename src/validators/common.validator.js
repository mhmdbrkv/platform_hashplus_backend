import { z } from "zod";
import mongoose from "mongoose";

export const mongoIdSchema = (fieldName) =>
  z.object({
    params: z
      .object({
        [fieldName]: z
          .string()
          .refine(
            (value) => mongoose.isValidObjectId(value),
            `${fieldName} must be a valid MongoDB ID`,
          ),
      })
      .strict(),
  });

export const paginationSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
      sort: z.string().optional(),
      fields: z.array(z.string()).optional(),
      keyword: z.string().optional(),
    })
    .optional(),
});
