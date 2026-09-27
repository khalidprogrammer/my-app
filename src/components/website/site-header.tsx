"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, quoteHref, siteConfig } from "@/config/site";
import type { PublicContact } from "@/lib/queries";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded" aria-label={`${siteConfig.name} — home`}>
      <Image
        src="/images/logo.png"
        alt=""
        width={120}
        height={150}
        priority
        className="h-20 w-auto shrink-0 rounded-lg object-contain lg:h-[100px]"
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-tight text-ink sm:text-[17px]">
          {siteConfig.name}
          <span className="text-secondary-dark">.</span>
        </span>
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}

function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {mainNav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
              active ? "text-primary" : "text-ink hover:bg-faint hover:text-primary",
            )}
          >
            {item.label}
            {active && (
              <span aria-hidden className="absolute inset-x-3.5 -bottom-[1px] h-0.5 rounded-full bg-secondary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * SiteHeader — sticky corporate header (design.md §4):
 * utility bar (contact + language placeholder) + logo / nav / quote CTA.
 */
function SiteHeader({ onOpenMenu, menuOpen, contact }: { onOpenMenu: () => void; menuOpen: boolean; contact: PublicContact }) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {/* Utility bar */}
      <div className="hidden bg-primary-ink text-white md:block">
        <div className="container-site flex h-9 items-center justify-between text-[13px]">
          <p className="flex items-center gap-4">
            <a href={`mailto:${contact.email}`} className="rounded opacity-90 transition-opacity hover:opacity-100 hover:underline">
              {contact.email}
            </a>
            <span aria-hidden className="h-3 w-px bg-white/25" />
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="rounded opacity-90 transition-opacity hover:opacity-100 hover:underline">
              {contact.phone}
            </a>
          </p>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded opacity-90 transition-opacity hover:opacity-100"
            aria-label="Language: English (more languages coming soon)"
            title="More languages coming soon"
          >
            <Globe aria-hidden className="size-3.5" />
            <span className="font-semibold">EN</span>
          </button>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b border-border bg-surface/95 transition-shadow",
          scrolled && "shadow-[0_6px_20px_-10px_rgba(6,30,47,0.35)]",
        )}
      >
        <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Logo />
          <DesktopNav />
          <div className="flex items-center gap-2.5">
            <Link
              href={quoteHref}
              className="hidden h-10 items-center justify-center gap-2 rounded-full bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-[0_8px_18px_-8px_rgba(245,158,11,0.9)] transition-all hover:bg-secondary-dark sm:inline-flex"
            >
              Request a Quote
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <button
              type="button"
              onClick={onOpenMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-border text-ink transition-colors hover:border-primary hover:text-primary lg:hidden"
            >
              {menuOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader, Logo };
