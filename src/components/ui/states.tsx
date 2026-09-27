import * as React from "react";
import Link from "next/link";
import { PackageSearch, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — used for zero-result listings, empty inboxes, etc.
 */
function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-faint text-muted">
        {icon ?? <PackageSearch aria-hidden className="size-6" />}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
        >
          {actionLabel}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
        >
          {actionLabel}
          <ArrowRight aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

/**
 * ErrorState — inline failure panel with retry (forms, tables, sections).
 */
function ErrorState({
  title = "Something went wrong",
  message = "We could not load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-danger-tint/40 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger">
        <AlertTriangle aria-hidden className="size-6" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export { EmptyState, ErrorState };
