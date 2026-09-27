"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { assertSlugShape, resolveSlug } from "@/lib/validations/common";
import { categoryFormSchema } from "@/lib/validations/category";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

export async function saveCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("categories.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const parsed = categoryFormSchema.safeParse({
    name: formStr(formData, "name"),
    slug: formStr(formData, "slug"),
    description: formStr(formData, "description"),
    sortOrder: formStr(formData, "sortOrder") || "0",
    status: formStr(formData, "status") || "ACTIVE",
    seoTitle: formStr(formData, "seoTitle"),
    seoDescription: formStr(formData, "seoDescription"),
    seoKeywords: formStr(formData, "seoKeywords"),
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const slug = resolveSlug(parsed.data.name, parsed.data.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const clash = await db.category.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another category already uses this slug." };

  const data = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    sortOrder: parsed.data.sortOrder,
    status: parsed.data.status,
    seoTitle: parsed.data.seoTitle,
    seoDescription: parsed.data.seoDescription,
    seoKeywords: parsed.data.seoKeywords,
  };

  if (id) {
    const old = await db.category.findUnique({ where: { id } });
    if (!old) return { ok: false, message: "Category not found." };
    await db.category.update({ where: { id }, data });
    await logAudit("category.update", "category", id, { name: old.name, slug: old.slug }, { name: data.name, slug });
  } else {
    const created = await db.category.create({ data });
    await logAudit("category.create", "category", created.id, null, { name: data.name, slug });
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/about");
  return { ok: true, message: "Category saved." };
}

export async function deleteCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("categories.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing category." };

  const [productCount, childCount] = await Promise.all([
    db.product.count({ where: { categoryId: id, deletedAt: null } }),
    db.category.count({ where: { parentId: id, deletedAt: null } }),
  ]);
  if (productCount > 0) {
    return { ok: false, message: `Cannot delete: ${productCount} product${productCount === 1 ? " is" : "s are"} still in this category. Move them first.` };
  }
  if (childCount > 0) return { ok: false, message: "Cannot delete: this category has subcategories." };

  const old = await db.category.findUnique({ where: { id } });
  if (!old) return { ok: false, message: "Category not found." };
  await db.category.update({ where: { id }, data: { deletedAt: new Date(), status: "INACTIVE" } });
  await logAudit("category.delete", "category", id, { name: old.name, slug: old.slug });
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/about");
  return { ok: true, message: "Category deleted." };
}
