import Link from "next/link";
import { Search } from "lucide-react";
import type { ContactStatus, QuoteStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/website/pagination";
import { EmptyState } from "@/components/ui/states";
import { ContactUpdateForm } from "@/components/admin/contact-update-form";
import { deleteQuote } from "@/actions/quotes";
import { deleteContact } from "@/actions/contacts";

export const metadata = { title: "Quotes & Messages" };

const PAGE_SIZE = 15;
const QUOTE_STATUSES = ["NEW", "CONTACTED", "QUOTATION_SENT", "NEGOTIATION", "CONFIRMED", "COMPLETED", "REJECTED", "ARCHIVED"];
const CONTACT_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"];

function hrefFor(tab: string, params: { q?: string; status?: string }, page: number) {
  const sp = new URLSearchParams();
  sp.set("tab", tab);
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (page > 1) sp.set("page", String(page));
  return `/admin/quotes?${sp.toString()}`;
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; status?: string; page?: string }>;
}) {
  const ctx = await getAdminContext();
  const canQuotes = hasPermission(ctx, "quotes.view");
  const canDeleteQuotes = hasPermission(ctx, "quotes.delete");
  const canUpdateContacts = hasPermission(ctx, "contacts.update");
  const canDeleteContacts = hasPermission(ctx, "contacts.delete");
  if (!canQuotes && !canUpdateContacts) return <AccessDenied />;

  const params = await searchParams;
  const tab = params.tab === "messages" ? "messages" : "quotes";
  const q = params.q ?? "";
  const statusParam = params.status ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const quoteStatus: QuoteStatus | undefined = (QUOTE_STATUSES as string[]).includes(statusParam)
    ? (statusParam as QuoteStatus)
    : undefined;
  const contactStatus: ContactStatus | undefined = (CONTACT_STATUSES as string[]).includes(statusParam)
    ? (statusParam as ContactStatus)
    : undefined;

  if (tab === "messages" && !canUpdateContacts) return <AccessDenied />;
  if (tab === "quotes" && !canQuotes) return <AccessDenied />;

  let body: React.ReactNode;
  let totalPages = 0;

  if (tab === "messages") {
    const where = {
      ...(contactStatus ? { status: contactStatus } : {}),
      ...(q.trim()
        ? { OR: [{ name: { contains: q.trim() } }, { email: { contains: q.trim() } }, { subject: { contains: q.trim() } }] }
        : {}),
    };
    const [total, items, staff] = await Promise.all([
      db.contactMessage.count({ where }),
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { assignee: { select: { name: true } } },
      }),
      db.user.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
    totalPages = Math.ceil(total / PAGE_SIZE);

    body = items.length === 0 ? (
      <EmptyState title="No messages found" description="Contact form submissions will appear here." />
    ) : (
      <div className="flex flex-col gap-3">
        {items.map((m) => (
          <details key={m.id} className="rounded-lg border border-border bg-surface">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-5 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{m.name} — {m.email}</span>
                <span className="block truncate text-xs text-muted">
                  {m.subject || "(no subject)"} · {m.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {m.assignee ? ` · ${m.assignee.name}` : ""}
                </span>
              </span>
              <StatusBadge status={m.status} />
            </summary>
            <div className="flex flex-col gap-4 border-t border-border px-5 py-4">
              <p className="text-sm leading-relaxed whitespace-pre-line">{m.message}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted">
                {m.companyName && <span>Company: {m.companyName}</span>}
                {m.phone && <span>Phone: {m.phone}</span>}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <ContactUpdateForm id={m.id} currentStatus={m.status} staff={staff} />
                {canDeleteContacts && (
                  <DeleteButton
                    action={deleteContact}
                    id={m.id}
                    title="Delete message?"
                    description={`The message from ${m.name} will be permanently removed.`}
                  />
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
    );
  } else {
    const where = {
      ...(quoteStatus ? { status: quoteStatus } : {}),
      ...(q.trim()
        ? {
            OR: [
              { referenceNo: { contains: q.trim() } },
              { customerName: { contains: q.trim() } },
              { email: { contains: q.trim() } },
              { companyName: { contains: q.trim() } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      db.quote.count({ where }),
      db.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true, referenceNo: true, customerName: true, companyName: true, email: true,
          country: true, status: true, createdAt: true,
          assignee: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);
    totalPages = Math.ceil(total / PAGE_SIZE);

    body = items.length === 0 ? (
      <EmptyState title="No quotes found" description="Quotation requests from the website will appear here." />
    ) : (
      <TableScroll>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Received</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((x) => (
              <TableRow key={x.id}>
                <TableCell>
                  <Link href={`/admin/quotes/${x.id}`} className="rounded font-semibold text-primary hover:underline">
                    {x.referenceNo}
                  </Link>
                  <p className="text-xs text-muted">{x._count.items} item{x._count.items === 1 ? "" : "s"}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">{x.customerName}</p>
                  <p className="text-xs text-muted">{x.companyName ?? x.email}</p>
                </TableCell>
                <TableCell><StatusBadge status={x.status} /></TableCell>
                <TableCell>{x.assignee?.name ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {x.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <span className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/quotes/${x.id}`}
                      className="inline-flex h-8 items-center rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                    >
                      Open
                    </Link>
                    {canDeleteQuotes && (
                      <DeleteButton
                        action={deleteQuote}
                        id={x.id}
                        title="Delete quote?"
                        description={`${x.referenceNo} and its history will be permanently removed.`}
                      />
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    );
  }

  const statuses = tab === "messages" ? CONTACT_STATUSES : QUOTE_STATUSES;

  return (
    <>
      <PageHeader
        title={tab === "messages" ? "Contact messages" : "Quote requests"}
        description={tab === "messages" ? "Submissions from the contact form." : "Inquiries from the quotation form, with status history."}
      />

      <div className="flex gap-2" role="tablist" aria-label="Inquiries">
        {(canQuotes ? (canUpdateContacts ? (["quotes", "messages"] as const) : (["quotes"] as const)) : (["messages"] as const)).map((t) => (
          <Link
            key={t}
            href={`/admin/quotes?tab=${t}`}
            role="tab"
            aria-selected={tab === t}
            className={
              tab === t
                ? "inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
                : "inline-flex h-9 items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            }
          >
            {t === "quotes" ? "Quotes" : "Messages"}
          </Link>
        ))}
      </div>

      <form method="get" action="/admin/quotes" role="search" className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="tab" value={tab} />
        <label className="relative flex-1">
          <span className="sr-only">Search {tab}</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={tab === "quotes" ? "Search reference, customer or email…" : "Search name, email or subject…"}
            className="h-10 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Filter by status</span>
          <select
            name="status"
            defaultValue={statusParam}
            className="h-10 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
          Filter
        </button>
      </form>

      {body}
      <Pagination page={page} totalPages={totalPages} buildHref={(p) => hrefFor(tab, { q, status: statusParam }, p)} />
    </>
  );
}
