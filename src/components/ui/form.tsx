import * as React from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink shadow-none transition-colors placeholder:text-muted/70 hover:border-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-faint disabled:opacity-70 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20";

/* ---------- Label ---------- */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("mb-1.5 block text-sm font-semibold text-ink", className)}
    {...props}
  >
    {children}
    {required && (
      <span aria-hidden className="ml-1 text-danger">
        *
      </span>
    )}
  </label>
));
Label.displayName = "Label";

/* ---------- Input ---------- */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(controlClass, "h-10", className)} {...props} />
  ),
);
Input.displayName = "Input";

/* ---------- Textarea ---------- */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(controlClass, "min-h-24 resize-y", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

/* ---------- Select (styled native — full keyboard + screen-reader support) ---------- */
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(controlClass, "h-10 appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

/* ---------- Checkbox ---------- */
const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer appearance-none rounded border border-border bg-surface transition-colors",
        "checked:border-primary checked:bg-primary checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%273.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27><path d=%27M20 6 9 17l-5-5%27/></svg>')] checked:bg-center checked:bg-no-repeat",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";

/* ---------- Field wrapper: label + control + hint + inline error ---------- */
function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              id: htmlFor,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": [error ? errorId : null, hint ? hintId : null]
                .filter(Boolean)
                .join(" ") || undefined,
            })
          : child,
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Save / Cancel row (design.md §12) ---------- */
function FormActions({
  onCancel,
  submitLabel = "Save changes",
  cancelLabel = "Cancel",
  pending,
  className,
}: {
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

export { Label, Input, Textarea, Select, Checkbox, Field, FormActions };
