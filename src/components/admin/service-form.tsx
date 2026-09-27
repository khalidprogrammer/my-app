"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { saveService } from "@/actions/services";

export type ServiceInitial = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  benefits: string[];
  process: string[];
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
};

/** ServiceForm — shared create/edit side-form (PRD §5.4 fields). */
function ServiceForm({ initial }: { initial?: ServiceInitial }) {
  const [state, dispatch] = useActionState(saveService, { ok: false, message: "" });
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
      if (initial) router.push("/admin/services");
    }
  }, [state, toast, router, initial]);

  React.useEffect(() => {
    done.current = false;
  }, [initial?.id]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">{initial ? "Edit service" : "New service"}</h2>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />
      <Field label="Name" htmlFor="service-name" required>
        <Input id="service-name" name="name" required maxLength={255} defaultValue={initial?.name} placeholder="e.g. Freight Forwarding" />
      </Field>
      <SlugField nameInputId="service-name" defaultValue={initial?.slug} />
      <Field label="Short description" htmlFor="service-short">
        <Textarea id="service-short" name="shortDescription" rows={2} defaultValue={initial?.shortDescription ?? ""} placeholder="One or two sentences for cards." />
      </Field>
      <Field label="Full description" htmlFor="service-description">
        <Textarea id="service-description" name="description" rows={5} defaultValue={initial?.description ?? ""} placeholder="Service overview…" />
      </Field>
      <Field label="Benefits" htmlFor="service-benefits" hint="One benefit per line.">
        <Textarea id="service-benefits" name="benefitsText" rows={4} defaultValue={initial?.benefits.join("\n") ?? ""} placeholder={"Door-to-door coordination\nWritten delivery terms"} />
      </Field>
      <Field label="Process" htmlFor="service-process" hint="One step per line, in order.">
        <Textarea id="service-process" name="processText" rows={4} defaultValue={initial?.process.join("\n") ?? ""} placeholder={"Share your requirements\nReceive a written scope"} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="CTA label" htmlFor="service-cta-label">
          <Input id="service-cta-label" name="ctaLabel" maxLength={100} defaultValue={initial?.ctaLabel ?? ""} placeholder="Request this service" />
        </Field>
        <Field label="CTA link" htmlFor="service-cta-href">
          <Input id="service-cta-href" name="ctaHref" maxLength={500} defaultValue={initial?.ctaHref ?? ""} placeholder="/quote" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sort order" htmlFor="service-sort">
          <Input id="service-sort" name="sortOrder" inputMode="numeric" defaultValue={initial?.sortOrder ?? 0} />
        </Field>
        <Field label="Status" htmlFor="service-status">
          <Select id="service-status" name="status" defaultValue={initial?.status ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </Field>
      </div>
      <Field label="SEO title" htmlFor="service-seo-title">
        <Input id="service-seo-title" name="seoTitle" maxLength={255} defaultValue={initial?.seoTitle ?? ""} />
      </Field>
      <Field label="SEO description" htmlFor="service-seo-description">
        <Textarea id="service-seo-description" name="seoDescription" rows={2} maxLength={2000} defaultValue={initial?.seoDescription ?? ""} />
      </Field>
      <Field label="SEO keywords" htmlFor="service-seo-keywords">
        <Input id="service-seo-keywords" name="seoKeywords" maxLength={500} defaultValue={initial?.seoKeywords ?? ""} />
      </Field>
      <div className="flex gap-2">
        {initial && <CancelLink href="/admin/services" />}
        <AdminSubmit label={initial ? "Save changes" : "Create service"} className="flex-1" />
      </div>
    </form>
  );
}

export { ServiceForm };
