import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { QuoteUpdateForm } from "@/components/admin/quote-update-form";
import { deleteQuote } from "@/actions/quotes";

export const metadata = { title: "Quote Detail" };

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "quotes.view")) return <AccessDenied />;
  const canUpdate = hasPermission(ctx, "quotes.update");
  const canDelete = hasPermission(ctx, "quotes.delete");

  const { id } = await params;
  const [quote, staff] = await Promise.all([
    db.quote.findUnique({
      where: { id },
      include: {
        assignee: { select: { name: true } },
        attachment: { select: { url: true, fileName: true, mimeType: true, fileSize: true } },
        items: { include: { product: { select: { name: true, slug: true } } } },
        history: { include: { changer: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      },
    }),
    canUpdate
      ? db.user.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ]);
  if (!quote) notFound();

  return (
    <>
      <PageHeader
        title={quote.referenceNo}
        description={`Received ${quote.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        actions={
          <span className="flex items-center gap-2">
            <Link
              href="/admin/quotes"
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <ArrowLeft aria-hidden className="size-4" />
              All quotes
            </Link>
            {canDelete && (
              <DeleteButton
                action={deleteQuote}
                id={quote.id}
                title="Delete quote?"
                description={`${quote.referenceNo} and its history will be permanently removed.`}
                redirectTo="/admin/quotes"
              />
            )}
          </span>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* Customer */}
          <section className="rounded-lg border border-border bg-surface p-5" aria-label="Customer">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Customer</h2>
              <StatusBadge status={quote.status} />
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold text-muted">Name</dt><dd>{quote.customerName}</dd></div>
              {quote.companyName && <div><dt className="font-semibold text-muted">Company</dt><dd>{quote.companyName}</dd></div>}
              <div><dt className="font-semibold text-muted">Email</dt><dd><a href={`mailto:${quote.email}`} className="rounded text-primary hover:underline">{quote.email}</a></dd></div>
              {quote.phone && <div><dt className="font-semibold text-muted">Phone</dt><dd>{quote.phone}</dd></div>}
              {(quote.country || quote.city) && (
                <div><dt className="font-semibold text-muted">Destination</dt><dd>{[quote.city, quote.country].filter(Boolean).join(", ")}</dd></div>
              )}
              <div><dt className="font-semibold text-muted">Assignee</dt><dd>{quote.assignee?.name ?? "Unassigned"}</dd></div>
            </dl>
            {quote.message && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm font-semibold text-muted">Message</p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{quote.message}</p>
              </div>
            )}
            {quote.attachment && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm font-semibold text-muted">Attachment</p>
                <a
                  href={quote.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  <Paperclip aria-hidden className="size-4 shrink-0" />
                  <span className="truncate">{quote.attachment.fileName}</span>
                  <span className="shrink-0 text-xs font-normal text-muted">
                    {Math.max(1, Math.round(Number(quote.attachment.fileSize) / 1024))} KB
                  </span>
                </a>
              </div>
            )}
          </section>

          {/* Items */}
          <section className="overflow-hidden rounded-lg border border-border bg-surface" aria-label="Requested items">
            <h2 className="border-b border-border px-5 py-3.5 text-base font-semibold">Requested items</h2>
            <TableScroll className="rounded-none border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product ? (
                          <Link href={`/products/${item.product.slug}`} className="rounded font-semibold text-primary hover:underline">
                            {item.productName}
                          </Link>
                        ) : (
                          <span className="font-semibold">{item.productName}</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{item.quantity.toString()}{item.unit ? ` ${item.unit}` : ""}</TableCell>
                      <TableCell>{item.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          </section>

          {/* Status history */}
          <section className="rounded-lg border border-border bg-surface p-5" aria-label="Status history">
            <h2 className="text-base font-semibold">Status history</h2>
            {quote.history.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No transitions recorded.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-0">
                {quote.history.map((h) => (
                  <li key={h.id} className="relative flex gap-3 pb-4 pl-5 last:pb-0">
                    <span aria-hidden className="absolute top-1.5 left-1 size-2 rounded-full bg-primary" />
                    <span aria-hidden className="absolute top-4 bottom-0 left-[7px] w-px bg-border last:hidden" />
                    <div className="text-sm">
                      <p>
                        <strong>{h.oldStatus ?? "—"} → {h.newStatus}</strong>
                        {h.changer && <span className="text-muted"> by {h.changer.name}</span>}
                      </p>
                      <p className="text-xs text-muted">
                        {h.createdAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {h.note && <p className="mt-1 leading-relaxed">{h.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {canUpdate && (
          <section className="rounded-lg border border-border bg-surface p-5" aria-label="Update quote">
            <h2 className="mb-4 text-base font-semibold">Update</h2>
            <QuoteUpdateForm
              id={quote.id}
              currentStatus={quote.status}
              assignedTo={quote.assignedTo}
              staff={staff}
            />
          </section>
        )}
      </div>
    </>
  );
}
