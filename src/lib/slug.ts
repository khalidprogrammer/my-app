/**
 * URL-safe slugs: "Machinery & Equipment" → "machinery-and-equipment".
 * Server uses this as the fallback when an admin leaves the slug blank.
 */
export function slugify(input: string, max = 180): string {
  const ascii = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ");
  const slug = ascii
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, max)
    .replace(/-+$/g, "");
  return slug || "item";
}
