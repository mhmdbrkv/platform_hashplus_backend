import { z } from "zod";
import mongoose from "mongoose";

export const mongoIdSchema = (fieldName) =>
  z.object({
    params: z.object({
      [fieldName]: z.custom((value) => {
        if (!mongoose.isValidObjectId(value)) {
          throw new Error(`${fieldName} must be a valid MongoDB ID`);
        }
        return value;
      }),
    }),
  });

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    sort: z.string().optional(),
    fields: z.array(z.string()).optional(),
    keyword: z.string().optional(),
  }),
});
