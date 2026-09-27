"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";

export type ToastVariant = "success" | "warning" | "danger" | "info";

export type ToastData = {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInput = Omit<ToastData, "id">;

const ToastContext = React.createContext<{ toast: (t: ToastInput) => void } | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bar: string; Icon: typeof Info }> = {
  success: { bar: "bg-success", Icon: CheckCircle2 },
  warning: { bar: "bg-warning", Icon: AlertTriangle },
  danger: { bar: "bg-danger", Icon: XCircle },
  info: { bar: "bg-primary", Icon: Info },
};

const DISMISS_MS = 5000;
let nextId = 1;

/** useToast — push a notification: toast({ title, description, variant }). */
export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

function ToastCard({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const variant = toast.variant ?? "info";
  const { bar, Icon } = VARIANT_STYLES[variant];

  React.useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
    >
      <span aria-hidden className={cn("w-1 self-stretch", bar)} />
      <Icon aria-hidden className="mt-3.5 size-5 shrink-0 text-ink" />
      <div className="min-w-0 flex-1 py-3">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="mt-2 mr-2 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-faint hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/**
 * ToastProvider — wraps the app (see app/layout.tsx). Renders an
 * aria-live notification stack, bottom-right on desktop, full-width
 * bottom sheet on mobile.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);
  const mounted = useMounted();

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback((input: ToastInput) => {
    const id = nextId++;
    setToasts((prev) => [...prev.slice(-3), { ...input, id }]);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
          >
            {toasts.map((t) => (
              <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
