"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { assertSlugShape, resolveSlug } from "@/lib/validations/common";
import { articleFormSchema, newsCategoryFormSchema } from "@/lib/validations/news";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

function revalidateNews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/news");
  if (slug) revalidatePath(`/news/${slug}`);
}

export async function saveArticle(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("news.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const parsed = articleFormSchema.safeParse({
    title: formStr(formData, "title"),
    slug: formStr(formData, "slug"),
    categoryId: formStr(formData, "categoryId"),
    excerpt: formStr(formData, "excerpt"),
    content: formStr(formData, "content"),
    status: formStr(formData, "status") || "DRAFT",
    publishedAt: formStr(formData, "publishedAt"),
    seoTitle: formStr(formData, "seoTitle"),
    seoDescription: formStr(formData, "seoDescription"),
    seoKeywords: formStr(formData, "seoKeywords"),
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const d = parsed.data;

  const slug = resolveSlug(d.title, d.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const clash = await db.newsArticle.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another article already uses this slug." };
  if (d.categoryId) {
    const cat = await db.newsCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } });
    if (!cat) return { ok: false, message: "Choose a valid category." };
  }

  const publishedAt = d.publishedAt ? new Date(d.publishedAt) : null;
  if (publishedAt && Number.isNaN(publishedAt.getTime())) return { ok: false, message: "Publish date is invalid." };
  const data = {
    title: d.title,
    slug,
    categoryId: d.categoryId ?? null,
    excerpt: d.excerpt,
    content: d.content,
    status: d.status,
    publishedAt: d.status === "PUBLISHED" ? (publishedAt ?? new Date()) : publishedAt,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    seoKeywords: d.seoKeywords,
  };

  if (id) {
    const old = await db.newsArticle.findUnique({ where: { id }, select: { title: true, slug: true } });
    if (!old) return { ok: false, message: "Article not found." };
    await db.newsArticle.update({ where: { id }, data });
    await logAudit("article.update", "news_article", id, { title: old.title }, { title: data.title, slug });
  } else {
    const created = await db.newsArticle.create({
      data: { ...data, authorId: ctx.user.id },
      select: { id: true },
    });
    await logAudit("article.create", "news_article", created.id, null, { title: data.title, slug });
  }

  revalidateNews(slug);
  return { ok: true, message: "Article saved." };
}

export async function deleteArticle(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("news.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing article." };

  const old = await db.newsArticle.findUnique({ where: { id }, select: { title: true, slug: true } });
  if (!old) return { ok: false, message: "Article not found." };
  await db.newsArticle.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
  await logAudit("article.delete", "news_article", id, { title: old.title, slug: old.slug });
  revalidateNews();
  return { ok: true, message: "Article deleted." };
}

export async function saveNewsCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("news.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const parsed = newsCategoryFormSchema.safeParse({
    name: formStr(formData, "name"),
    slug: formStr(formData, "slug"),
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const slug = resolveSlug(parsed.data.name, parsed.data.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const clash = await db.newsCategory.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another category already uses this slug." };

  if (id) {
    await db.newsCategory.update({ where: { id }, data: { name: parsed.data.name, slug } });
    await logAudit("news_category.update", "news_category", id, null, { name: parsed.data.name, slug });
  } else {
    const created = await db.newsCategory.create({
      data: { name: parsed.data.name, slug },
      select: { id: true },
    });
    await logAudit("news_category.create", "news_category", created.id, null, { name: parsed.data.name, slug });
  }
  revalidateNews();
  return { ok: true, message: "Category saved." };
}

export async function deleteNewsCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("news.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing category." };

  const [articleCount, old] = await Promise.all([
    db.newsArticle.count({ where: { categoryId: id, deletedAt: null } }),
    db.newsCategory.findUnique({ where: { id }, select: { name: true } }),
  ]);
  if (!old) return { ok: false, message: "Category not found." };
  if (articleCount > 0) {
    return { ok: false, message: `Cannot delete: ${articleCount} article${articleCount === 1 ? " is" : "s are"} still in this category.` };
  }
  await db.newsCategory.delete({ where: { id } });
  await logAudit("news_category.delete", "news_category", id, { name: old.name });
  revalidateNews();
  return { ok: true, message: "Category deleted." };
}
