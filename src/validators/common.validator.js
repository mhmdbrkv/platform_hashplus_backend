import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/);

export const pagination = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});
