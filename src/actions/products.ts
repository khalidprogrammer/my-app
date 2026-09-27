"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { assertSlugShape, resolveSlug } from "@/lib/validations/common";
import { parseImages, parseSpecs, productFormSchema } from "@/lib/validations/product";
import { firstIssue, formBool, formStr, requirePerm, type ActionResult } from "./_helpers";

function revalidateProduct(slug: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/quote");
  if (categorySlug) revalidatePath(`/categories/${categorySlug}`);
}

export async function saveProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("products.create");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;
  if (id) {
    const upd = await requirePerm("products.update");
    if (!upd.ctx) return { ok: false, message: upd.error };
  }

  let parsed;
  try {
    parsed = productFormSchema.safeParse({
      name: formStr(formData, "name"),
      slug: formStr(formData, "slug"),
      sku: formStr(formData, "sku"),
      categoryId: formStr(formData, "categoryId"),
      shortDescription: formStr(formData, "shortDescription"),
      description: formStr(formData, "description"),
      brand: formStr(formData, "brand"),
      model: formStr(formData, "model"),
      origin: formStr(formData, "origin"),
      applications: formStr(formData, "applications"),
      packaging: formStr(formData, "packaging"),
      moq: formStr(formData, "moq"),
      unit: formStr(formData, "unit"),
      featured: formBool(formData, "featured"),
      status: formStr(formData, "status") || "DRAFT",
      seoTitle: formStr(formData, "seoTitle"),
      seoDescription: formStr(formData, "seoDescription"),
      seoKeywords: formStr(formData, "seoKeywords"),
      imagesJson: formStr(formData, "imagesJson") || "[]",
      specsJson: formStr(formData, "specsJson") || "[]",
    });
  } catch {
    return { ok: false, message: "Invalid form data." };
  }
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const d = parsed.data;

  let images: { mediaId: string; isPrimary: boolean }[];
  let specs: { name: string; value: string }[];
  try {
    images = parseImages(d.imagesJson);
    specs = parseSpecs(d.specsJson);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Invalid images or specifications." };
  }

  const slug = resolveSlug(d.name, d.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const slugClash = await db.product.findUnique({ where: { slug }, select: { id: true } });
  if (slugClash && slugClash.id !== id) return { ok: false, message: "Another product already uses this slug." };
  if (d.sku) {
    const skuClash = await db.product.findUnique({ where: { sku: d.sku }, select: { id: true } });
    if (skuClash && skuClash.id !== id) return { ok: false, message: "Another product already uses this SKU." };
  }
  const category = await db.category.findFirst({
    where: { id: d.categoryId, deletedAt: null },
    select: { id: true, slug: true },
  });
  if (!category) return { ok: false, message: "Choose a valid category." };
  if (images.length > 0) {
    const mediaCount = await db.media.count({ where: { id: { in: images.map((i) => i.mediaId) } } });
    if (mediaCount !== images.length) return { ok: false, message: "One or more selected images no longer exist." };
  }

  const primaryCount = images.filter((i) => i.isPrimary).length;
  const normalizedImages = images.map((img, idx) => ({
    mediaId: img.mediaId,
    // If none (or several) marked primary, the first wins.
    isPrimary: primaryCount === 1 ? img.isPrimary : idx === 0,
    sortOrder: idx,
  }));

  const data = {
    categoryId: category.id,
    name: d.name,
    slug,
    sku: d.sku,
    shortDescription: d.shortDescription,
    description: d.description,
    brand: d.brand,
    model: d.model,
    origin: d.origin,
    applications: d.applications,
    packaging: d.packaging,
    moq: d.moq,
    unit: d.unit,
    featured: d.featured,
    status: d.status,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
  };

  if (id) {
    const old = await db.product.findUnique({ where: { id }, select: { name: true, slug: true } });
    if (!old) return { ok: false, message: "Product not found." };
    await db.$transaction([
      db.productImage.deleteMany({ where: { productId: id } }),
      db.productSpecification.deleteMany({ where: { productId: id } }),
      db.product.update({
        where: { id },
        data: {
          ...data,
          updatedBy: ctx.user.id,
          images: { create: normalizedImages },
          specs: { create: specs.map((s, idx) => ({ ...s, sortOrder: idx })) },
        },
      }),
    ]);
    await logAudit("product.update", "product", id, { name: old.name, slug: old.slug }, { name: data.name, slug });
  } else {
    const created = await db.product.create({
      data: {
        ...data,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
        images: { create: normalizedImages },
        specs: { create: specs.map((s, idx) => ({ ...s, sortOrder: idx })) },
      },
      select: { id: true },
    });
    await logAudit("product.create", "product", created.id, null, { name: data.name, slug });
  }

  revalidateProduct(slug, category.slug);
  return { ok: true, message: "Product saved." };
}

export async function deleteProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("products.delete");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing product." };

  const product = await db.product.findUnique({
    where: { id },
    select: { name: true, slug: true, category: { select: { slug: true } }, _count: { select: { quoteItems: true } } },
  });
  if (!product) return { ok: false, message: "Product not found." };
  if (product._count.quoteItems > 0) {
    return { ok: false, message: "Cannot delete: this product appears in quotation history. Set its status to Archived instead." };
  }

  await db.$transaction([
    db.productImage.deleteMany({ where: { productId: id } }),
    db.productSpecification.deleteMany({ where: { productId: id } }),
    db.product.delete({ where: { id } }),
  ]);
  await logAudit("product.delete", "product", id, { name: product.name, slug: product.slug });
  revalidateProduct(product.slug, product.category.slug);
  return { ok: true, message: "Product deleted." };
}
