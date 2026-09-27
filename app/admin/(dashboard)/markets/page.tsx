import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { MarketForm } from "@/components/admin/market-form";
import { deleteMarket } from "@/actions/markets";

export const metadata = { title: "Markets" };

const TYPE_LABEL: Record<string, string> = { IMPORT: "Import", EXPORT: "Export", BOTH: "Import & Export" };

export default async function AdminMarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "markets.manage")) return <AccessDenied />;

  const { edit } = await searchParams;
  const [markets, editing] = await Promise.all([
    db.market.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, countryCode: true, type: true, sortOrder: true, status: true },
    }),
    edit
      ? db.market.findUnique({
          where: { id: edit },
          select: { id: true, name: true, slug: true, countryCode: true, type: true, description: true, sortOrder: true, status: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader title="Markets" description="Only configure markets the company actually serves." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {markets.length === 0 ? (
            <EmptyState title="No markets configured" description="Add the first served market." />
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markets.map((m) => (
                    <TableRow key={m.id} className={edit === m.id ? "bg-primary-tint/50" : undefined}>
                      <TableCell>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs text-muted">/{m.slug}{m.countryCode ? ` · ${m.countryCode}` : ""}</p>
                      </TableCell>
                      <TableCell><Badge variant="outline">{TYPE_LABEL[m.type]}</Badge></TableCell>
                      <TableCell>{m.sortOrder}</TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
                      <TableCell>
                        <span className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/markets?edit=${m.id}`}
                            aria-label={`Edit ${m.name}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                          >
                            <Pencil aria-hidden className="size-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </Link>
                          <DeleteButton
                            action={deleteMarket}
                            id={m.id}
                            title="Delete market?"
                            description={`“${m.name}” will be removed from the website.`}
                          />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableScroll>
          )}
        </div>
        <MarketForm key={editing?.id ?? "new"} initial={editing ?? undefined} />
      </div>
    </>
  );
}
