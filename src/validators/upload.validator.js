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
      fileName: z.string().trim().min(3).max(255),
      fileType: z.string().trim().min(3).max(255),
      userId: isObjectId(z.string(), "userId"),
      partsCount: z.coerce.number().int().min(1).max(10000),
    })
    .strict(),
});

export const completeUploadSchema = z.object({
  body: z
    .object({
      key: z.string().trim().min(3).max(255),
      uploadId: z.string().trim().min(3).max(255),
      parts: z.array(
        z.object({
          PartNumber: z.coerce.number().int().min(1).max(10000),
          ETag: z.string().trim().min(3).max(255),
        }),
      ),
    })
    .strict(),
});

export const removeUploadSchema = z.object({
  body: z
    .object({
      key: z.string().trim().min(3).max(255),
      uploadId: z.string().trim().min(3).max(255),
    })
    .strict(),
});
