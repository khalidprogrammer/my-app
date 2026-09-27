"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { saveArticle } from "@/actions/news";

export type ArticleInitial = {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  excerpt: string | null;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
};

/** ArticleForm — shared create/edit form. */
function ArticleForm({
  initial,
  categories,
}: {
  initial?: ArticleInitial;
  categories: { id: string; name: string }[];
}) {
  const [state, dispatch] = useActionState(saveArticle, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.ok && !done.current) {
      done.current = true;
      toast({ title: state.message, variant: "success" });
      router.push("/admin/news");
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 md:p-6 xl:col-span-2">
          <Field label="Title" htmlFor="article-title" required>
            <Input id="article-title" name="title" required maxLength={255} defaultValue={initial?.title} placeholder="Article headline" />
          </Field>
          <SlugField nameInputId="article-title" defaultValue={initial?.slug} />
          <Field label="Excerpt" htmlFor="article-excerpt" hint="Shown on cards and in search results.">
            <Textarea id="article-excerpt" name="excerpt" rows={2} defaultValue={initial?.excerpt ?? ""} />
          </Field>
          <Field label="Content" htmlFor="article-content" required>
            <Textarea id="article-content" name="content" rows={14} required defaultValue={initial?.content} placeholder="Full article text…" />
          </Field>
        </div>
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
          <Field label="Status" htmlFor="article-status">
            <Select id="article-status" name="status" defaultValue={initial?.status ?? "DRAFT"}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <Field label="Category" htmlFor="article-category">
            <Select id="article-category" name="categoryId" defaultValue={initial?.categoryId ?? ""}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Publish date" htmlFor="article-published" hint="Blank means now when publishing.">
            <Input id="article-published" name="publishedAt" type="datetime-local" defaultValue={initial?.publishedAt ?? ""} />
          </Field>
          <Field label="SEO title" htmlFor="article-seo-title">
            <Input id="article-seo-title" name="seoTitle" maxLength={255} defaultValue={initial?.seoTitle ?? ""} />
          </Field>
          <Field label="SEO description" htmlFor="article-seo-description">
            <Textarea id="article-seo-description" name="seoDescription" rows={2} maxLength={2000} defaultValue={initial?.seoDescription ?? ""} />
          </Field>
          <Field label="SEO keywords" htmlFor="article-seo-keywords">
            <Input id="article-seo-keywords" name="seoKeywords" maxLength={500} defaultValue={initial?.seoKeywords ?? ""} />
          </Field>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <CancelLink href="/admin/news" />
        <AdminSubmit label={initial ? "Save changes" : "Create article"} />
      </div>
    </form>
  );
}

export { ArticleForm };
