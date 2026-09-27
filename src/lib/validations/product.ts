import { z } from "zod";
import { nameField, nullableDecimal, optionalText, slugInput } from "./common";

const imageSchema = z.object({ mediaId: z.string().min(1), isPrimary: z.boolean() });

const specSchema = z.object({ name: z.string().trim().min(1).max(191), value: z.string().trim().min(1) });

export const productStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const productFormSchema = z.object({
  name: nameField("Product name"),
  slug: slugInput,
  sku: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  categoryId: z.string().min(1, "Choose a category."),
  shortDescription: optionalText(2000),
  description: optionalText(60000),
  brand: optionalText(191),
  model: optionalText(191),
  origin: optionalText(191),
  applications: optionalText(60000),
  packaging: optionalText(255),
  moq: nullableDecimal,
  unit: optionalText(50),
  featured: z.boolean(),
  status: productStatusSchema,
  seoTitle: optionalText(255),
  seoDescription: optionalText(2000),
  seoKeywords: optionalText(500),
  imagesJson: z.string().default("[]"),
  specsJson: z.string().default("[]"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export function parseImages(json: string): { mediaId: string; isPrimary: boolean }[] {
  try {
    const arr = z.array(imageSchema).parse(JSON.parse(json || "[]"));
    const seen = new Set<string>();
    return arr.filter((i) => (seen.has(i.mediaId) ? false : (seen.add(i.mediaId), true)));
  } catch {
    throw new Error("Product images are invalid.");
  }
}

export function parseSpecs(json: string): { name: string; value: string }[] {
  try {
    return z.array(specSchema).max(100).parse(JSON.parse(json || "[]"));
  } catch {
    throw new Error("Specifications are invalid.");
  }
}
