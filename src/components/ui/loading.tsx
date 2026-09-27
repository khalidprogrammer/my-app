import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Spinner — inline loading indicator. */
function Spinner({ className, label = "Loading…" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex items-center", className)}>
      <Loader2 aria-hidden className="size-5 animate-spin text-primary" />
    </span>
  );
}

/** Skeleton — content placeholder block. */
function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-faint", className)} />;
}

/** PageLoader — full-area loading state. */
function PageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16" role="status" aria-label={message}>
      <Loader2 aria-hidden className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

/** TableSkeleton — loading placeholder for admin data tables. */
function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface" aria-hidden>
      <div className="border-b border-border bg-faint/60 px-4 py-3">
        <Skeleton className="h-4 w-1/3" />
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-border px-4 py-3.5 last:border-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className={cn("h-4", c === 0 ? "w-1/4" : "w-1/6")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** CardSkeleton — loading placeholder for product grids. */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface" aria-hidden>
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-9 w-28" />
      </div>
    </div>
  );
}

export { Spinner, Skeleton, PageLoader, TableSkeleton, CardSkeleton };
