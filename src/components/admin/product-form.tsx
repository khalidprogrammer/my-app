"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select, Checkbox } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { SpecsEditor, type SpecRow } from "@/components/admin/specs-editor";
import { MediaPicker, type MediaOption, type ImageSelection } from "@/components/admin/media-picker";
import { saveProduct } from "@/actions/products";

export type ProductInitial = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  categoryId: string;
  shortDescription: string | null;
  description: string | null;
  brand: string | null;
  model: string | null;
  origin: string | null;
  applications: string | null;
  packaging: string | null;
  moq: string | null;
  unit: string | null;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  specs: SpecRow[];
  images: ImageSelection[];
};

/**
 * ProductForm — shared create/edit form covering every PRD §6 field.
 */
function ProductForm({
  initial,
  categories,
  media,
}: {
  initial?: ProductInitial;
  categories: { id: string; name: string }[];
  media: MediaOption[];
}) {
  const [state, dispatch] = useActionState(saveProduct, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.ok && !done.current) {
      done.current = true;
      toast({ title: state.message, variant: "success" });
      router.push("/admin/products");
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 md:p-6" aria-label="Basic information">
            <h2 className="text-base font-semibold">Basic information</h2>
            <Field label="Product name" htmlFor="product-name" required>
              <Input id="product-name" name="name" required maxLength={255} defaultValue={initial?.name} placeholder="e.g. Hydraulic Gear Pump" />
            </Field>
            <SlugField nameInputId="product-name" defaultValue={initial?.slug} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="SKU" htmlFor="sku" hint="Unique when provided.">
                <Input id="sku" name="sku" maxLength={100} defaultValue={initial?.sku ?? ""} placeholder="e.g. HP-200-20M" />
              </Field>
              <Field label="Category" htmlFor="categoryId" required>
                <Select id="categoryId" name="categoryId" required defaultValue={initial?.categoryId ?? ""}>
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Short description" htmlFor="shortDescription">
              <Textarea id="shortDescription" name="shortDescription" rows={2} maxLength={2000} defaultValue={initial?.shortDescription ?? ""} placeholder="One or two sentences for cards and search results." />
            </Field>
            <Field label="Full description" htmlFor="description">
              <Textarea id="description" name="description" rows={6} defaultValue={initial?.description ?? ""} placeholder="Detailed product description…" />
            </Field>
          </section>

          <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 md:p-6" aria-label="Details">
            <h2 className="text-base font-semibold">Details</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Brand" htmlFor="brand"><Input id="brand" name="brand" maxLength={191} defaultValue={initial?.brand ?? ""} /></Field>
              <Field label="Model" htmlFor="model"><Input id="model" name="model" maxLength={191} defaultValue={initial?.model ?? ""} /></Field>
              <Field label="Origin" htmlFor="origin"><Input id="origin" name="origin" maxLength={191} defaultValue={initial?.origin ?? ""} placeholder="e.g. Zhejiang, China" /></Field>
              <Field label="Packaging" htmlFor="packaging"><Input id="packaging" name="packaging" maxLength={255} defaultValue={initial?.packaging ?? ""} placeholder="e.g. Export carton on pallets" /></Field>
              <Field label="MOQ" htmlFor="moq" hint="Minimum order quantity."><Input id="moq" name="moq" inputMode="decimal" defaultValue={initial?.moq ?? ""} placeholder="e.g. 100" /></Field>
              <Field label="Unit" htmlFor="unit"><Input id="unit" name="unit" maxLength={50} defaultValue={initial?.unit ?? ""} placeholder="e.g. pieces" /></Field>
            </div>
            <Field label="Applications" htmlFor="applications">
              <Textarea id="applications" name="applications" rows={3} defaultValue={initial?.applications ?? ""} placeholder="Where and how the product is used…" />
            </Field>
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 md:p-6" aria-label="Specifications">
            <h2 className="text-base font-semibold">Specifications</h2>
            <SpecsEditor initial={initial?.specs} />
          </section>

          <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 md:p-6" aria-label="SEO">
            <h2 className="text-base font-semibold">SEO</h2>
            <Field label="SEO title" htmlFor="seoTitle"><Input id="seoTitle" name="seoTitle" maxLength={255} defaultValue={initial?.seoTitle ?? ""} /></Field>
            <Field label="SEO description" htmlFor="seoDescription"><Textarea id="seoDescription" name="seoDescription" rows={2} maxLength={2000} defaultValue={initial?.seoDescription ?? ""} /></Field>
            <Field label="SEO keywords" htmlFor="seoKeywords" hint="Comma-separated."><Input id="seoKeywords" name="seoKeywords" maxLength={500} defaultValue={initial?.seoKeywords ?? ""} /></Field>
          </section>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5 md:p-6" aria-label="Publishing">
            <h2 className="text-base font-semibold">Publishing</h2>
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm">
              <Checkbox name="featured" defaultChecked={initial?.featured ?? false} className="mt-0.5" />
              <span>
                <span className="font-semibold">Featured product</span>
                <span className="block text-[13px] text-muted">Show on the homepage featured section.</span>
              </span>
            </label>
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 md:p-6" aria-label="Images">
            <h2 className="text-base font-semibold">Images</h2>
            <MediaPicker media={media} initial={initial?.images} />
          </section>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <CancelLink href="/admin/products" />
        <AdminSubmit label={initial ? "Save changes" : "Create product"} />
      </div>
    </form>
  );
}

export { ProductForm };
