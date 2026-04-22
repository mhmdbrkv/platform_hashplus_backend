import { z } from "zod";

export const objectId = (fieldName) =>
  z.object({
    params: z.object({
      [fieldName]: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, `${fieldName} must be a valid MongoDB ID`),
    }),
  });

export const pagination = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});
