import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    review: z.string().min(5).max(1000),
    content: z.string().regex(/^[a-f\d]{24}$/i, "Invalid content ID"),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    review: z.string().min(5).max(1000).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid review ID"),
  }),
});
