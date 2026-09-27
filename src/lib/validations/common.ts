import { z } from "zod";
import { slugify } from "@/lib/slug";

/** Optional slug: blank means "derive from name"; otherwise strict format. */
export const slugInput = z.string().trim().max(191);

export function resolveSlug(name: string, slug?: string): string {
  const s = (slug ?? "").trim();
  return s ? slugify(s) : slugify(name);
}

export function assertSlugShape(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export const nameField = (label: string, max = 255) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

export const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

export const nullableDecimal = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : Number.NaN;
  })
  .pipe(z.number({ error: "Enter a valid non-negative number." }).optional());

/** One-per-line textarea → string array (benefits, process steps). */
export function linesToArray(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}
