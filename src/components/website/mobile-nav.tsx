"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, quoteHref } from "@/config/site";
import type { PublicContact } from "@/lib/queries";

/**
 * MobileNav — dropdown panel under the sticky header (design.md §4, §13).
 * Closes on route change or ESC. No animation beyond a simple transition.
 */
function MobileNav({ open, onClose, contact }: { open: boolean; onClose: () => void; contact: PublicContact }) {
  const pathname = usePathname();

  React.useEffect(() => {
    onClose();
    // Close on navigation; pathname is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div id="mobile-nav" className="sticky top-16 z-40 border-b border-border bg-surface lg:hidden">
      <nav aria-label="Mobile" className="container-site flex flex-col py-3">
        {mainNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-semibold transition-colors",
                active ? "bg-primary-tint text-primary" : "text-ink hover:bg-faint",
              )}
            >
              {item.label}
              <ArrowRight aria-hidden className="size-4 opacity-50" />
            </Link>
          );
        })}
        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4 pb-2">
          <Link
            href={quoteHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark"
          >
            Request a Quote
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <div className="flex items-center justify-center gap-5 pt-1 text-[13px] text-muted">
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 rounded hover:text-primary">
              <Phone aria-hidden className="size-3.5" />
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 rounded hover:text-primary">
              <Mail aria-hidden className="size-3.5" />
              Email us
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export { MobileNav };
