import { z } from "zod";

const priceSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().default("SAR"),
});

export const createContentSchema = z.object({
  body: z.object({
    contentType: z.enum(["course", "bootcamp"]),
    title: z.string().min(3).max(200),
    category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
    description: z.string().min(10),
    learningOutcomes: z.array(z.string()).min(1),
    prerequisites: z.array(z.string()).min(1),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    language: z.enum(["ar", "en", "fr"]).optional(),
    price: z.union([priceSchema, z.number().min(0)]),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    progress: z.number().min(0).max(100),
  }),
  params: z.object({
    contentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid content ID"),
  }),
});
