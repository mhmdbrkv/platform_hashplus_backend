import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
  }),
  params: z.object({
    categoryId: z.custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error(`categoryId must be a valid MongoDB ID`);
      }
      return value;
    }),
  }),
});
