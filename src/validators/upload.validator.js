import { z } from "zod";
import mongoose from "mongoose";

const isObjectId = (schema, fieldName = "ID") =>
  schema.refine(
    (value) => mongoose.isValidObjectId(value),
    `${fieldName} must be a valid MongoDB ID`,
  );

export const startUploadSchema = z.object({
  body: z
    .object({
      fileName: z.string().trim(),
      fileType: z.string().trim(),
      userId: isObjectId(z.string(), "userId"),
      partsCount: z.coerce.number().int().min(1).max(10000),
    })
    .strict(),
});

export const completeUploadSchema = z.object({
  body: z
    .object({
      key: z.string().trim(),
      uploadId: z.string().trim(),
      parts: z
        .array(
          z.object({
            PartNumber: z.coerce.number().int().min(1).max(10000),
            ETag: z.string().trim(),
          }),
        )
        .min(1),
    })
    .strict(),
});

export const removeUploadSchema = z.object({
  body: z
    .object({
      key: z.string().trim(),
      uploadId: z.string().trim(),
    })
    .strict(),
});
