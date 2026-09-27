"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button with pending state for admin forms (useFormStatus). */
function AdminSubmit({
  label,
  pendingLabel = "Saving…",
  className,
  danger,
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
  danger?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        danger ? "bg-danger text-white hover:brightness-95" : "bg-primary text-primary-foreground hover:bg-primary-dark",
        className,
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Inline form result message (error only; success navigates or toasts). */
function FormMessage({ state }: { state: { ok: boolean; message: string } }) {
  if (state.ok || !state.message) return null;
  return (
    <p role="alert" className="rounded-md border border-danger/30 bg-danger-tint/50 px-4 py-3 text-sm font-medium text-danger">
      {state.message}
    </p>
  );
}

/** Cancel/back link styled as a secondary button. */
function CancelLink({ href, label = "Cancel" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </a>
  );
}

export { AdminSubmit, FormMessage, CancelLink };
