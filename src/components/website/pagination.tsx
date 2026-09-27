import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination — numbered links preserving existing query params.
 * `buildHref(page)` is supplied by the page (server component).
 */
function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} aria-label="Previous page" className={cn(btn, "border-border bg-surface text-ink hover:border-primary hover:text-primary")}>
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(btn, "cursor-not-allowed border-border bg-surface text-muted/40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btn,
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-ink hover:border-primary hover:text-primary",
            )}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} aria-label="Next page" className={cn(btn, "border-border bg-surface text-ink hover:border-primary hover:text-primary")}>
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(btn, "cursor-not-allowed border-border bg-surface text-muted/40")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

export { Pagination };
