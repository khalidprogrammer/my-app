"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { assertSlugShape, resolveSlug } from "@/lib/validations/common";
import { marketFormSchema } from "@/lib/validations/market";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

export async function saveMarket(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("markets.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const parsed = marketFormSchema.safeParse({
    name: formStr(formData, "name"),
    slug: formStr(formData, "slug"),
    countryCode: formStr(formData, "countryCode"),
    type: formStr(formData, "type") || "BOTH",
    description: formStr(formData, "description"),
    sortOrder: formStr(formData, "sortOrder") || "0",
    status: formStr(formData, "status") || "ACTIVE",
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const d = parsed.data;

  const slug = resolveSlug(d.name, d.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const clash = await db.market.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another market already uses this slug." };

  const data = {
    name: d.name,
    slug,
    countryCode: d.countryCode?.toUpperCase(),
    type: d.type,
    description: d.description,
    sortOrder: d.sortOrder,
    status: d.status,
  };

  if (id) {
    const old = await db.market.findUnique({ where: { id }, select: { name: true } });
    if (!old) return { ok: false, message: "Market not found." };
    await db.market.update({ where: { id }, data });
    await logAudit("market.update", "market", id, { name: old.name }, { name: data.name, slug });
  } else {
    const created = await db.market.create({ data, select: { id: true } });
    await logAudit("market.create", "market", created.id, null, { name: data.name, slug });
  }

  revalidatePath("/");
  revalidatePath("/markets");
  revalidatePath(`/markets/${slug}`);
  revalidatePath("/about");
  return { ok: true, message: "Market saved." };
}

export async function deleteMarket(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("markets.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing market." };

  const old = await db.market.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (!old) return { ok: false, message: "Market not found." };
  await db.market.delete({ where: { id } });
  await logAudit("market.delete", "market", id, { name: old.name, slug: old.slug });
  revalidatePath("/");
  revalidatePath("/markets");
  return { ok: true, message: "Market deleted." };
}
