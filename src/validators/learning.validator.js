import { z } from "zod";
import mongoose from "mongoose";

export const addToMyLearningSchemam = z.object({
  body: z.object({
    contentId: z.custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error("Invalid content ID");
      }
      return value;
    }),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    progress: z.coerce.number().min(0).max(100),
  }),
  params: z.object({
    contentId: z.custom((value) => {
      if (!mongoose.isValidObjectId(value)) {
        throw new Error("Invalid content ID");
      }
      return value;
    }),
  }),
});
