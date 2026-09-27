import { z } from "zod";

/**
 * Public quote validation (Phase 5). Testable without the Next runtime —
 * the server action in actions/quote.ts parses with these schemas.
 */

export const quoteItemSchema = z.object({
  productId: z.string().trim().max(100).optional(),
  productName: z.string().trim().min(1, "Enter a product for every item.").max(255),
  quantity: z.coerce.number().positive("Enter a quantity greater than 0.").max(1_000_000_000),
  unit: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

export const MAX_QUOTE_ITEMS = 10;

export const quoteItemsSchema = z
  .array(quoteItemSchema)
  .min(1, "Add at least one product to your request.")
  .max(MAX_QUOTE_ITEMS, `At most ${MAX_QUOTE_ITEMS} products per request.`);

export const quoteFormSchema = z.object({
  country: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  customerName: z.string().trim().min(1, "Please enter your name.").max(191),
  companyName: z.string().trim().max(191).optional(),
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address.").max(191),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().max(5000).optional(),
});

export type QuoteFormInput = z.infer<typeof quoteFormSchema>;

export function parseQuoteItems(json: string): QuoteItemInput[] {
  let raw: unknown;
  try {
    raw = JSON.parse(json || "[]");
  } catch {
    throw new Error("The product list is invalid. Please try again.");
  }
  const parsed = quoteItemsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "The product list is invalid.");
  }
  return parsed.data;
}
