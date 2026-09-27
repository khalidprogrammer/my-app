import { z } from "zod";
import { nameField, optionalText, slugInput } from "./common";

export const categoryFormSchema = z.object({
  name: nameField("Category name", 191),
  slug: slugInput,
  description: optionalText(60000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  seoTitle: optionalText(255),
  seoDescription: optionalText(2000),
  seoKeywords: optionalText(500),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
