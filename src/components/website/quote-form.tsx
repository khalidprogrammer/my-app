"use client";

import * as React from "react";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { MAX_QUOTE_ITEMS } from "@/lib/validations/quote-public";
import { submitQuote } from "@/actions/quote";

export type QuoteProductOption = { id: string; name: string; slug: string };

type ItemRow = {
  key: number;
  custom: boolean;
  slug: string;
  customName: string;
  quantity: string;
  unit: string;
  notes: string;
};

let nextKey = 1;
function blankRow(): ItemRow {
  return { key: nextKey++, custom: false, slug: "", customName: "", quantity: "", unit: "", notes: "" };
}

/**
 * QuoteForm — two-step inquiry wizard (design.md §9, Phase 5):
 * Step 1: up to MAX_QUOTE_ITEMS products + destination.
 * Step 2: contact details + optional attachment.
 * Confirmation panel shows the reference number on success.
 */
function QuoteForm({
  products,
  initialProductSlug,
  initialProductName,
}: {
  products: QuoteProductOption[];
  initialProductSlug?: string;
  initialProductName?: string;
}) {
  const [state, dispatch, pending] = useActionState(submitQuote, { ok: false, message: "" });
  const [step, setStep] = React.useState(1);
  const [stepError, setStepError] = React.useState("");
  const [items, setItems] = React.useState<ItemRow[]>(() => {
    const first = blankRow();
    if (initialProductSlug) {
      first.slug = initialProductSlug;
    } else {
      first.custom = products.length === 0;
      first.customName = initialProductName ?? "";
    }
    return [first];
  });
  const [fileName, setFileName] = React.useState("");

  const bySlug = React.useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  const patchRow = (key: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  // Serialized payload for the server action.
  const itemsJson = JSON.stringify(
    items.map((r) => {
      const found = !r.custom ? bySlug.get(r.slug) : undefined;
      return {
        ...(found ? { productId: found.id } : {}),
        productName: found ? found.name : r.customName.trim(),
        quantity: Number(r.quantity),
        ...(r.unit.trim() ? { unit: r.unit.trim() } : {}),
        ...(r.notes.trim() ? { notes: r.notes.trim() } : {}),
      };
    }),
  );

  const proceed = () => {
    if (items.length === 0) {
      setStepError("Add at least one product to your request.");
      return;
    }
    for (const [i, r] of items.entries()) {
      const found = !r.custom ? bySlug.get(r.slug) : undefined;
      const name = found ? found.name : r.customName.trim();
      if (!name) {
        setStepError(`Item ${i + 1}: choose a product or describe it.`);
        return;
      }
      const qty = Number(r.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        setStepError(`Item ${i + 1}: enter a quantity greater than 0.`);
        return;
      }
    }
    setStepError("");
    setStep(2);
  };

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-lg border border-success/30 bg-success-tint/50 p-6 md:p-8">
        <span className="flex size-11 items-center justify-center rounded-full bg-success-tint text-success">
          <CheckCircle2 aria-hidden className="size-6" />
        </span>
        <h2 className="text-2xl">Thank you.</h2>
        <p className="leading-relaxed text-muted">{state.message}</p>
        {state.referenceNo && (
          <p className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm">
            Your reference number: <strong className="font-mono">{state.referenceNo}</strong>
            {state.itemCount != null && state.itemCount > 1 && (
              <span className="text-muted"> · {state.itemCount} products</span>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={dispatch} className="flex flex-col gap-6">
      {/* Progress */}
      <ol className="flex items-center gap-2 text-sm font-semibold" aria-label="Form progress">
        {[1, 2].map((n) => (
          <li key={n} className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                step >= n ? "bg-primary text-primary-foreground" : "bg-faint text-muted",
              )}
            >
              {n}
            </span>
            <span className={step === n ? "text-ink" : "text-muted"}>
              {n === 1 ? "Products & destination" : "Contact & attachment"}
            </span>
            {n === 1 && <span aria-hidden className="mx-2 h-px w-8 bg-border" />}
          </li>
        ))}
      </ol>

      <input type="hidden" name="itemsJson" value={itemsJson} readOnly />

      {step === 1 && (
        <fieldset className="flex flex-col gap-5">
          <legend className="sr-only">Products and destination</legend>

          <div className="flex flex-col gap-4">
            {items.map((row, i) => (
              <div key={row.key} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">Item {i + 1}</p>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((r) => r.key !== row.key))}
                      aria-label={`Remove item ${i + 1}`}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-danger transition-colors hover:bg-danger-tint"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  )}
                </div>

                {products.length > 0 && !row.custom && (
                  <Field label="Product" htmlFor={`item-product-${row.key}`} required>
                    <Select
                      id={`item-product-${row.key}`}
                      value={row.slug}
                      onChange={(e) => {
                        if (e.target.value === "__custom") patchRow(row.key, { custom: true, slug: "" });
                        else patchRow(row.key, { slug: e.target.value });
                      }}
                    >
                      <option value="">Select a product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.slug}>{p.name}</option>
                      ))}
                      <option value="__custom">Other / not listed</option>
                    </Select>
                  </Field>
                )}
                {(row.custom || products.length === 0) && (
                  <Field label={products.length > 0 ? "Describe the product" : "Product"} htmlFor={`item-custom-${row.key}`} required>
                    <div className="flex gap-2">
                      <Input
                        id={`item-custom-${row.key}`}
                        value={row.customName}
                        maxLength={255}
                        onChange={(e) => patchRow(row.key, { customName: e.target.value })}
                        placeholder="e.g. Hydraulic gear pump, 20 MPa"
                        className="flex-1"
                      />
                      {products.length > 0 && (
                        <button
                          type="button"
                          onClick={() => patchRow(row.key, { custom: false, customName: "" })}
                          className="h-10 shrink-0 cursor-pointer rounded-md border border-border px-3 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
                        >
                          Pick from catalog
                        </button>
                      )}
                    </div>
                  </Field>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Quantity" htmlFor={`item-qty-${row.key}`} required>
                    <Input
                      id={`item-qty-${row.key}`}
                      value={row.quantity}
                      inputMode="decimal"
                      onChange={(e) => patchRow(row.key, { quantity: e.target.value })}
                      placeholder="e.g. 500"
                    />
                  </Field>
                  <Field label="Unit" htmlFor={`item-unit-${row.key}`}>
                    <Input
                      id={`item-unit-${row.key}`}
                      value={row.unit}
                      maxLength={50}
                      onChange={(e) => patchRow(row.key, { unit: e.target.value })}
                      placeholder="e.g. pieces"
                    />
                  </Field>
                </div>
                <Field label="Item notes" htmlFor={`item-notes-${row.key}`}>
                  <Input
                    id={`item-notes-${row.key}`}
                    value={row.notes}
                    maxLength={2000}
                    onChange={(e) => patchRow(row.key, { notes: e.target.value })}
                    placeholder="Specifications, target price…"
                  />
                </Field>
              </div>
            ))}
          </div>

          {items.length < MAX_QUOTE_ITEMS ? (
            <div>
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, blankRow()])}
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                <Plus aria-hidden className="size-4" />
                Add another product ({items.length}/{MAX_QUOTE_ITEMS})
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">Maximum {MAX_QUOTE_ITEMS} products per request — contact us directly for larger lists.</p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Destination country" htmlFor="country">
              <Input id="country" name="country" autoComplete="country-name" maxLength={100} placeholder="e.g. Germany" />
            </Field>
            <Field label="City / port" htmlFor="city">
              <Input id="city" name="city" maxLength={100} placeholder="e.g. Hamburg" />
            </Field>
          </div>

          {stepError && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger-tint/50 px-4 py-3 text-sm font-medium text-danger">
              {stepError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={proceed}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Continue
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="flex flex-col gap-5">
          <legend className="sr-only">Contact details and attachment</legend>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="customerName" required>
              <Input name="customerName" autoComplete="name" required maxLength={191} placeholder="Jane Cooper" />
            </Field>
            <Field label="Company" htmlFor="companyName">
              <Input name="companyName" autoComplete="organization" maxLength={191} placeholder="Company Ltd." />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Email" htmlFor="email" required>
              <Input name="email" type="email" autoComplete="email" required maxLength={191} placeholder="you@company.com" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input name="phone" type="tel" autoComplete="tel" maxLength={50} placeholder="+1 555 000 1234" />
            </Field>
          </div>
          <Field label="Message" htmlFor="message" hint="Specifications, target price, timeline — anything that helps us quote accurately.">
            <Textarea name="message" maxLength={5000} rows={5} placeholder="Additional details…" />
          </Field>
          <Field
            label="Attachment"
            htmlFor="attachment"
            hint="Optional — drawings, packing lists or spec sheets. PDF, Word, Excel, CSV, TXT or images, max 10 MB."
          >
            <label
              htmlFor="attachment"
              className="flex cursor-pointer items-center gap-2.5 rounded-md border border-dashed border-border bg-surface px-4 py-3 text-sm transition-colors hover:border-primary"
            >
              <Paperclip aria-hidden className="size-4 shrink-0 text-muted" />
              <span className={fileName ? "font-semibold text-ink" : "text-muted"}>
                {fileName || "Choose a file…"}
              </span>
              <Input
                id="attachment"
                name="attachment"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.gif,.avif"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                className="sr-only"
              />
            </label>
          </Field>

          {!state.ok && state.message && (
            <p role="alert" className="rounded-md border border-danger/30 bg-danger-tint/50 px-4 py-3 text-sm font-medium text-danger">
              {state.message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-secondary px-7 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit quotation request"}
            </button>
          </div>
        </fieldset>
      )}
    </form>
  );
}

export { QuoteForm };
