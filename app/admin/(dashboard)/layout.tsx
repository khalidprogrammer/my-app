import { redirect } from "next/navigation";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { AdminShell, type AdminNavItem } from "@/components/admin/admin-shell";

const ALL_NAV: (AdminNavItem & { permission?: string })[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "products", label: "Products", href: "/admin/products", permission: "products.view" },
  { key: "categories", label: "Categories", href: "/admin/categories", permission: "categories.manage" },
  { key: "services", label: "Services", href: "/admin/services", permission: "services.manage" },
  { key: "markets", label: "Markets", href: "/admin/markets", permission: "markets.manage" },
  { key: "quotes", label: "Quotes & Messages", href: "/admin/quotes", permission: "quotes.view" },
  { key: "news", label: "News", href: "/admin/news", permission: "news.manage" },
  { key: "gallery", label: "Gallery", href: "/admin/gallery", permission: "gallery.manage" },
  { key: "media", label: "Media", href: "/admin/media", permission: "media.view" },
  { key: "settings", label: "Settings", href: "/admin/settings", permission: "settings.manage" },
  { key: "users", label: "Users", href: "/admin/users", permission: "users.manage" },
];

/**
 * Dashboard segment layout — hard gate: no session, no render.
 * The login page lives outside this group (app/admin/login) so it
 * never hits this gate. Individual pages check their own permission.
 */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");

  const nav = ALL_NAV.filter((item) => !item.permission || hasPermission(ctx, item.permission)).map(
    ({ key, label, href }) => ({ key, label, href }),
  );

  return (
    <AdminShell user={ctx.user} roles={ctx.roles} nav={nav}>
      {children}
    </AdminShell>
  );
}
