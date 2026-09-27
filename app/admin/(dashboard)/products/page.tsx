import Link from "next/link";
import { Plus, Pencil, Search } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/website/pagination";
import { EmptyState } from "@/components/ui/states";
import { deleteProduct } from "@/actions/products";

export const metadata = { title: "Products" };

const PAGE_SIZE = 15;

async function getRows(q: string, page: number) {
  const term = q.trim();
  const where = {
    deletedAt: null,
    ...(term
      ? { OR: [{ name: { contains: term } }, { sku: { contains: term } }, { brand: { contains: term } }] }
      : {}),
  };
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, slug: true, sku: true, featured: true, status: true, updatedAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);
  return { total, items, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "products.view")) return <AccessDenied />;
  const canCreate = hasPermission(ctx, "products.create");
  const canDelete = hasPermission(ctx, "products.delete");

  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { total, items, totalPages } = await getRows(q, page);

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/admin/products${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"} in the catalog.`}
        actions={
          canCreate ? (
            <Link
              href="/admin/products/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              <Plus aria-hidden className="size-4" />
              New product
            </Link>
          ) : undefined
        }
      />

      <form method="get" action="/admin/products" role="search" className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, SKU or brand…"
            className="h-10 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
          Search
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No products found"
          description={q ? "Try a different search." : "Create the first product to start the catalog."}
          actionLabel={canCreate && !q ? "New product" : undefined}
          actionHref={canCreate && !q ? "/admin/products/new" : undefined}
        />
      ) : (
        <TableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-semibold">{p.name}</p>
                    {p.sku && <p className="text-xs text-muted">SKU: {p.sku}</p>}
                  </TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>{p.featured ? "Yes" : "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {p.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label={`Edit ${p.name}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                      >
                        <Pencil aria-hidden className="size-3.5" />
                        <span className="hidden xl:inline">Edit</span>
                      </Link>
                      {canDelete && (
                        <DeleteButton
                          action={deleteProduct}
                          id={p.id}
                          title="Delete product?"
                          description={`“${p.name}” and its specifications will be permanently removed. Products in quotation history cannot be deleted.`}
                        />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      )}
      <Pagination page={page} totalPages={totalPages} buildHref={hrefFor} />
    </>
  );
}
