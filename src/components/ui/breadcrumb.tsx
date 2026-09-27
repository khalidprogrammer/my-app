import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb — SEO-friendly (ordered list) trail for detail pages
 * (design.md §8 product detail, §16 SEO UX).
 */
function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-small", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        <li>
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex items-center rounded transition-colors hover:text-primary"
          >
            <Home className="size-4" />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              <ChevronRight aria-hidden className="size-3.5 text-border" />
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded transition-colors hover:text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-semibold text-ink" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumb };
