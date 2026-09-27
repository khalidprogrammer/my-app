"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { saveCategory } from "@/actions/categories";

export type CategoryInitial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  status: "ACTIVE" | "INACTIVE";
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
};

/** CategoryForm — shared create/edit side-form. */
function CategoryForm({ initial }: { initial?: CategoryInitial }) {
  const [state, dispatch] = useActionState(saveCategory, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.ok && !done.current) {
      done.current = true;
      toast({ title: state.message, variant: "success" });
      if (!initial) formRef.current?.reset();
      router.refresh();
      if (initial) router.push("/admin/categories");
    }
  }, [state, toast, router, initial]);

  // Reset the guard when the edited row changes.
  React.useEffect(() => {
    done.current = false;
  }, [initial?.id]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">{initial ? "Edit category" : "New category"}</h2>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />
      <Field label="Name" htmlFor="category-name" required>
        <Input id="category-name" name="name" required maxLength={191} defaultValue={initial?.name} placeholder="e.g. Auto Parts" />
      </Field>
      <SlugField nameInputId="category-name" defaultValue={initial?.slug} />
      <Field label="Description" htmlFor="category-description">
        <Textarea id="category-description" name="description" rows={3} defaultValue={initial?.description ?? ""} placeholder="Short category description for cards." />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sort order" htmlFor="category-sort">
          <Input id="category-sort" name="sortOrder" inputMode="numeric" defaultValue={initial?.sortOrder ?? 0} />
        </Field>
        <Field label="Status" htmlFor="category-status">
          <Select id="category-status" name="status" defaultValue={initial?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
      </div>
      <Field label="SEO title" htmlFor="category-seo-title">
        <Input id="category-seo-title" name="seoTitle" maxLength={255} defaultValue={initial?.seoTitle ?? ""} />
      </Field>
      <Field label="SEO description" htmlFor="category-seo-description">
        <Textarea id="category-seo-description" name="seoDescription" rows={2} maxLength={2000} defaultValue={initial?.seoDescription ?? ""} />
      </Field>
      <Field label="SEO keywords" htmlFor="category-seo-keywords">
        <Input id="category-seo-keywords" name="seoKeywords" maxLength={500} defaultValue={initial?.seoKeywords ?? ""} />
      </Field>
      <div className="flex gap-2">
        {initial && <CancelLink href="/admin/categories" />}
        <AdminSubmit label={initial ? "Save changes" : "Create category"} className="flex-1" />
      </div>
    </form>
  );
}

export { CategoryForm };
