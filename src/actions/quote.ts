"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { parseQuoteItems, quoteFormSchema } from "@/lib/validations/quote-public";
import {
  ALLOWED_ATTACHMENT_MIME,
  MAX_ATTACHMENT_BYTES,
  saveUploadFile,
} from "@/lib/upload";

export type QuoteResult = { ok: boolean; message: string; referenceNo?: string; itemCount?: number };

function emptyToUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    if (out[key] === "") (out as Record<string, unknown>)[key] = undefined;
  }
  return out;
}

function buildReferenceNo() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `Q-${stamp}-${rand}`;
}

/**
 * Submit a quotation request (PRD §5.6, Phase 5): multiple products,
 * optional attachment, unique reference number. Rate-limited: 5/hour per IP.
 */
export async function submitQuote(_prev: QuoteResult, formData: FormData): Promise<QuoteResult> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`quote:${ip}`, 5, 60 * 60 * 1000)) {
    return { ok: false, message: "Too many requests sent. Please try again later." };
  }

  let items;
  try {
    items = parseQuoteItems(String(formData.get("itemsJson") ?? "[]"));
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "The product list is invalid." };
  }

  const parsed = quoteFormSchema.safeParse(
    emptyToUndefined({
      country: String(formData.get("country") ?? ""),
      city: String(formData.get("city") ?? ""),
      customerName: String(formData.get("customerName") ?? ""),
      companyName: String(formData.get("companyName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    }),
  );
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const d = parsed.data;

  // Optional attachment: validated type + size, random storage name.
  let attachmentId: string | undefined;
  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    try {
      const saved = await saveUploadFile(attachment, ALLOWED_ATTACHMENT_MIME, {
        subdir: "quotes",
        maxBytes: MAX_ATTACHMENT_BYTES,
      });
      const media = await db.media.create({ data: { ...saved, uploadedBy: null }, select: { id: true } });
      attachmentId = media.id;
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "The attachment could not be saved." };
    }
  }

  // Link items to catalog products where they still exist (optional).
  const wantedIds = [...new Set(items.map((i) => i.productId).filter((v): v is string => !!v))];
  const existing =
    wantedIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: wantedIds }, status: "PUBLISHED", deletedAt: null },
          select: { id: true },
        })
      : [];
  const existingIds = new Set(existing.map((p) => p.id));

  // Unique reference number, retrying on the rare collision.
  let referenceNo = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = buildReferenceNo();
    const exists = await db.quote.findUnique({ where: { referenceNo: candidate }, select: { id: true } });
    if (!exists) {
      referenceNo = candidate;
      break;
    }
  }
  if (!referenceNo) return { ok: false, message: "Could not create your request. Please try again." };

  await db.quote.create({
    data: {
      referenceNo,
      customerName: d.customerName,
      companyName: d.companyName,
      email: d.email,
      phone: d.phone,
      country: d.country,
      city: d.city,
      destination: [d.city, d.country].filter(Boolean).join(", ") || undefined,
      message: d.message,
      attachmentId,
      status: "NEW",
      items: {
        create: items.map((item) => ({
          productId: item.productId && existingIds.has(item.productId) ? item.productId : null,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes,
        })),
      },
      history: { create: { oldStatus: null, newStatus: "new", note: "Submitted via website." } },
    },
    select: { id: true },
  });

  return {
    ok: true,
    referenceNo,
    itemCount: items.length,
    message:
      items.length === 1
        ? "Thank you. Your quotation request has been received. Our team will review your request and contact you."
        : `Thank you. Your quotation request for ${items.length} products has been received. Our team will review your request and contact you.`,
  };
}
