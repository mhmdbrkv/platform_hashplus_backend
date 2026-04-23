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

const priceSchema = z.object({
  amount: z.coerce.number().min(0),
  currency: trimString(z.string()).default("SAR"),
});

const finalProjectSchema = z.object({
  title: trimString(z.string().min(3).max(200)),
  description: trimString(z.string().min(10)),
  tasks: z.array(trimString(z.string())).min(1),
  materials: z.array(trimString(z.string())).min(1),
});

const welcomeVideoSchema = z.object({
  url: trimString(z.url()),
  key: trimString(z.string()),
  size: z.coerce.number(),
  duration: z.coerce.number(),
});

const thumbnailSchema = z.object({
  url: trimString(z.url()),
  key: trimString(z.string()),
});

export const createContentSchema = z.object({
  body: z.object({
    contentType: z.enum(["course", "bootcamp"]),
    title: trimString(z.string().min(3).max(200)),
    category: isObjectId(z.string(), "category"),
    description: trimString(z.string().min(10)),

    instructor: isObjectId(z.string(), "instructor").optional(),
    learningOutcomes: z.array(trimString(z.string())).min(1).optional(),
    prerequisites: z.array(trimString(z.string())).min(1).optional(),
    welcomeMessage: trimString(z.string()).optional(),
    congratulationsMessage: trimString(z.string()).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    language: z.enum(["ar", "en", "fr"]).optional(),
    materials: z.array(trimString(z.string())).optional(),
    price: z.union([priceSchema, z.coerce.number().min(0)]).optional(),

    thumbnail: thumbnailSchema.optional(),
    welcomeVideo: welcomeVideoSchema.optional(),
    finalProject: finalProjectSchema.optional(),

    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    totalProjects: z.coerce.number().optional(),
  }),
});

export const updateContentSchema = z.object({
  body: z.object({
    title: trimString(z.string().min(3).max(200)).optional(),
    category: isObjectId(z.string(), "category").optional(),
    description: trimString(z.string().min(10)).optional(),
    learningOutcomes: z.array(trimString(z.string())).min(1).optional(),
    prerequisites: z.array(trimString(z.string())).min(1).optional(),
    welcomeMessage: trimString(z.string()).optional(),
    congratulationsMessage: trimString(z.string()).optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    language: z.enum(["ar", "en", "fr"]).optional(),
    materials: z.array(trimString(z.string())).optional(),
    price: z.union([priceSchema, z.coerce.number().min(0)]).optional(),

    thumbnail: thumbnailSchema.optional(),
    welcomeVideo: welcomeVideoSchema.optional(),
    finalProject: finalProjectSchema.optional(),

    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    totalProjects: z.coerce.number().optional(),
  }),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
  }),
});

export const completeFinalProjectSchema = z.object({
  body: z.object({
    links: z.array(trimString(z.url())).min(1),
    notes: trimString(z.string()).optional(),
  }),
  params: z.object({
    contentId: isObjectId(z.string(), "contentId"),
  }),
});
