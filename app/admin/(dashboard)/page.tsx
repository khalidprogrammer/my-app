import Link from "next/link";
import { ArrowRight, Package, Inbox, MailOpen, Newspaper } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/ui/badge";

export const metadata = { title: "Dashboard" };

async function getDashboard() {
  const [totalProducts, publishedProducts, newQuotes, pendingQuotes, newMessages, publishedArticles, recentQuotes, recentMessages] =
    await Promise.all([
      db.product.count({ where: { deletedAt: null } }),
      db.product.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      db.quote.count({ where: { status: "NEW" } }),
      db.quote.count({ where: { status: { in: ["CONTACTED", "QUOTATION_SENT", "NEGOTIATION", "CONFIRMED"] } } }),
      db.contactMessage.count({ where: { status: "NEW" } }),
      db.newsArticle.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      db.quote.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, referenceNo: true, customerName: true, status: true, createdAt: true },
      }),
      db.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, subject: true, status: true, createdAt: true },
      }),
    ]);
  return { totalProducts, publishedProducts, newQuotes, pendingQuotes, newMessages, publishedArticles, recentQuotes, recentMessages };
}

function Kpi({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <p className="text-3xl font-extrabold text-primary">{value}</p>
      <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
    </>
  );
  return href ? (
    <Link href={href} className="rounded-lg border border-border bg-surface p-5 transition-shadow hover:shadow-md">
      {body}
    </Link>
  ) : (
    <div className="rounded-lg border border-border bg-surface p-5">{body}</div>
  );
}

export default async function AdminDashboard() {
  const ctx = await getAdminContext();
  const data = await getDashboard();
  const canQuotes = hasPermission(ctx, "quotes.view");
  const canProducts = hasPermission(ctx, "products.view");
  const canNews = hasPermission(ctx, "news.manage");

  return (
    <>
      <PageHeader title={`Welcome, ${ctx?.user.name ?? "Admin"}`} description="Key figures and the latest inquiries across the website." />

      {/* KPI cards — design.md §10 */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <Kpi label="Total products" value={data.totalProducts} href={canProducts ? "/admin/products" : undefined} />
        <Kpi label="Published products" value={data.publishedProducts} href={canProducts ? "/admin/products" : undefined} />
        <Kpi label="New quotes" value={data.newQuotes} href={canQuotes ? "/admin/quotes" : undefined} />
        <Kpi label="Pending quotes" value={data.pendingQuotes} href={canQuotes ? "/admin/quotes" : undefined} />
        <Kpi label="New contact messages" value={data.newMessages} href={canQuotes ? "/admin/quotes?tab=messages" : undefined} />
        <Kpi label="Published articles" value={data.publishedArticles} href={canNews ? "/admin/news" : undefined} />
      </div>

      {canQuotes && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Inbox aria-hidden className="size-4 text-muted" />
                Recent quote requests
              </h2>
              <Link href="/admin/quotes" className="inline-flex items-center gap-1 rounded text-[13px] font-semibold text-primary hover:underline">
                View all <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {data.recentQuotes.length === 0 && <li className="px-5 py-4 text-sm text-muted">No quote requests yet.</li>}
              {data.recentQuotes.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/quotes/${q.id}`} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-faint/60">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{q.referenceNo} — {q.customerName}</span>
                      <span className="text-xs text-muted">{q.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </span>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <MailOpen aria-hidden className="size-4 text-muted" />
                Recent contact messages
              </h2>
              <Link href="/admin/quotes?tab=messages" className="inline-flex items-center gap-1 rounded text-[13px] font-semibold text-primary hover:underline">
                View all <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {data.recentMessages.length === 0 && <li className="px-5 py-4 text-sm text-muted">No messages yet.</li>}
              {data.recentMessages.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{m.name}{m.subject ? ` — ${m.subject}` : ""}</span>
                    <span className="text-xs text-muted">{m.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </span>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/products", Icon: Package, label: "Manage products", show: canProducts },
          { href: "/admin/quotes", Icon: Inbox, label: "Review inquiries", show: canQuotes },
          { href: "/admin/news", Icon: Newspaper, label: "Publish news", show: canNews },
        ]
          .filter((l) => l.show)
          .map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-sm font-semibold transition-shadow hover:shadow-md"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-primary-tint text-primary">
                <Icon aria-hidden className="size-4" />
              </span>
              {label}
              <ArrowRight aria-hidden className="ml-auto size-4 text-muted" />
            </Link>
          ))}
      </div>
    </>
  );
}
