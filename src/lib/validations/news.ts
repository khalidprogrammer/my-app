import { z } from "zod";
import { nameField, optionalText, slugInput } from "./common";

export const newsCategoryFormSchema = z.object({
  name: nameField("Category name", 191),
  slug: slugInput,
});

export const articleFormSchema = z.object({
  title: nameField("Article title"),
  slug: slugInput,
  categoryId: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  excerpt: optionalText(60000),
  content: z.string().trim().min(1, "Article content is required."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  seoTitle: optionalText(255),
  seoDescription: optionalText(2000),
  seoKeywords: optionalText(500),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;
