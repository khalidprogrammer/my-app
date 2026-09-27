import { z } from "zod";
import { nameField, optionalText, slugInput } from "./common";

export const serviceFormSchema = z.object({
  name: nameField("Service name"),
  slug: slugInput,
  shortDescription: optionalText(60000),
  description: optionalText(60000),
  benefitsText: optionalText(20000),
  processText: optionalText(20000),
  ctaLabel: optionalText(100),
  ctaHref: optionalText(500),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: optionalText(255),
  seoDescription: optionalText(2000),
  seoKeywords: optionalText(500),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;
