"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Wrench,
  Globe2,
  Inbox,
  Newspaper,
  Images,
  Image as ImageIcon,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { siteConfig } from "@/config/site";

export type AdminNavItem = { key: string; label: string; href: string };

const ICONS: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  products: Package,
  categories: FolderTree,
  services: Wrench,
  markets: Globe2,
  quotes: Inbox,
  news: Newspaper,
  gallery: Images,
  media: ImageIcon,
  settings: Settings,
  users: Users,
};

/**
 * AdminShell — dense dashboard frame (design.md §10): sidebar + topbar.
 * Collapsible drawer on mobile/tablet, fixed sidebar on desktop.
 */
function AdminShell({
  user,
  roles,
  nav,
  children,
}: {
  user: { name: string; email: string };
  roles: string[];
  nav: AdminNavItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const close = React.useCallback(() => setOpen(false), []);

  const sidebar = (
    <div className="flex h-full flex-col bg-primary-ink text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/admin" className="min-w-0 rounded text-[13px] leading-snug font-extrabold tracking-tight">
          {siteConfig.shortName}<span className="text-secondary">.</span>
          <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 align-middle text-[10px] font-bold tracking-widest uppercase">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-white/70 hover:bg-white/10 lg:hidden"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const Icon = ICONS[item.key] ?? LayoutDashboard;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                    active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="rounded-md bg-white/5 px-3 py-2.5">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-white/60">{user.email}</p>
          <p className="mt-1 truncate text-[11px] font-semibold tracking-wide text-secondary uppercase">
            {roles.join(" · ")}
          </p>
        </div>
        <form action={logout} className="mt-2">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut aria-hidden className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-theme flex min-h-screen bg-background text-ink">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute inset-0 cursor-default bg-primary-ink/60" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-ink hover:border-primary hover:text-primary lg:hidden"
          >
            <Menu aria-hidden className="size-4" />
          </button>
          <Link href="/" className="hidden items-center gap-1.5 rounded text-[13px] font-semibold text-muted hover:text-primary sm:inline-flex">
            <ArrowLeft aria-hidden className="size-3.5" />
            View website
          </Link>
          <span className="ml-auto text-[13px] text-muted">
            Signed in as <strong className="text-ink">{user.name}</strong>
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export { AdminShell };
