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

export const startUploadSchema = z.object({
  body: z.object({
    fileName: trimString(z.string()),
    fileType: trimString(z.string()),
    userId: isObjectId(z.string(), "userId"),
    partsCount: z.coerce.number().int().min(1).max(10000),
  }),
});

export const completeUploadSchema = z.object({
  body: z.object({
    key: trimString(z.string()),
    uploadId: trimString(z.string()),
    parts: z.array(
      z.object({
        PartNumber: z.coerce.number().int().min(1).max(10000),
        ETag: trimString(z.string()),
      }),
    ),
  }),
});

export const removeUploadSchema = z.object({
  body: z.object({
    key: trimString(z.string()),
    uploadId: trimString(z.string()),
  }),
});
