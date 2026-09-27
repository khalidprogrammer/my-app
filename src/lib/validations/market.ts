import { z } from "zod";
import { nameField, optionalText, slugInput } from "./common";

export const marketFormSchema = z.object({
  name: nameField("Market name", 191),
  slug: slugInput,
  countryCode: z.string().trim().max(10).optional().or(z.literal("").transform(() => undefined)),
  type: z.enum(["IMPORT", "EXPORT", "BOTH"]),
  description: optionalText(60000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type MarketFormData = z.infer<typeof marketFormSchema>;
