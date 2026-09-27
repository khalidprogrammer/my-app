"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { assertSlugShape, linesToArray, resolveSlug } from "@/lib/validations/common";
import { serviceFormSchema } from "@/lib/validations/service";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

export async function saveService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("services.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const parsed = serviceFormSchema.safeParse({
    name: formStr(formData, "name"),
    slug: formStr(formData, "slug"),
    shortDescription: formStr(formData, "shortDescription"),
    description: formStr(formData, "description"),
    benefitsText: formStr(formData, "benefitsText"),
    processText: formStr(formData, "processText"),
    ctaLabel: formStr(formData, "ctaLabel"),
    ctaHref: formStr(formData, "ctaHref"),
    sortOrder: formStr(formData, "sortOrder") || "0",
    status: formStr(formData, "status") || "DRAFT",
    seoTitle: formStr(formData, "seoTitle"),
    seoDescription: formStr(formData, "seoDescription"),
    seoKeywords: formStr(formData, "seoKeywords"),
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const d = parsed.data;

  const slug = resolveSlug(d.name, d.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const clash = await db.service.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another service already uses this slug." };

  const benefits = linesToArray(d.benefitsText);
  const process = linesToArray(d.processText);
  const data = {
    name: d.name,
    slug,
    shortDescription: d.shortDescription,
    description: d.description,
    benefits: benefits.length > 0 ? benefits : Prisma.JsonNull,
    process: process.length > 0 ? process : Prisma.JsonNull,
    cta: d.ctaLabel && d.ctaHref ? { label: d.ctaLabel, href: d.ctaHref } : Prisma.JsonNull,
    sortOrder: d.sortOrder,
    status: d.status,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
  };

  if (id) {
    const old = await db.service.findUnique({ where: { id }, select: { name: true, slug: true } });
    if (!old) return { ok: false, message: "Service not found." };
    await db.service.update({ where: { id }, data });
    await logAudit("service.update", "service", id, { name: old.name }, { name: data.name, slug });
  } else {
    const created = await db.service.create({ data, select: { id: true } });
    await logAudit("service.create", "service", created.id, null, { name: data.name, slug });
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  revalidatePath("/about");
  return { ok: true, message: "Service saved." };
}

export async function deleteService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("services.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing service." };

  const old = await db.service.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (!old) return { ok: false, message: "Service not found." };
  await db.service.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
  await logAudit("service.delete", "service", id, { name: old.name, slug: old.slug });
  revalidatePath("/");
  revalidatePath("/services");
  return { ok: true, message: "Service deleted." };
}
