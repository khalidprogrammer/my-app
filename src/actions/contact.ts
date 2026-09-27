"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(191),
  companyName: z.string().trim().max(191).optional(),
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address.").max(191),
  phone: z.string().trim().max(50).optional(),
  subject: z.string().trim().max(255).optional(),
  message: z.string().trim().min(10, "Please describe your request (at least 10 characters).").max(5000),
});

export type ContactResult = { ok: boolean; message: string };

function emptyToUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    if (out[key] === "") (out as Record<string, unknown>)[key] = undefined;
  }
  return out;
}

/** Submit a contact message (PRD §5.7). Rate-limited: 5/hour per IP. */
export async function submitContact(_prev: ContactResult, formData: FormData): Promise<ContactResult> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return { ok: false, message: "Too many messages sent. Please try again later." };
  }

  const parsed = contactSchema.safeParse(
    emptyToUndefined({
      name: String(formData.get("name") ?? ""),
      companyName: String(formData.get("companyName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    }),
  );
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const d = parsed.data;
  await db.contactMessage.create({
    data: {
      name: d.name,
      companyName: d.companyName,
      email: d.email,
      phone: d.phone,
      subject: d.subject,
      message: d.message,
      status: "NEW",
    },
  });

  return { ok: true, message: "Thank you. Your message has been received — our team will reply shortly." };
}
