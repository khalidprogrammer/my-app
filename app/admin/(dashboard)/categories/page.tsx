import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { CategoryForm } from "@/components/admin/category-form";
import { deleteCategory } from "@/actions/categories";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "categories.manage")) return <AccessDenied />;

  const { edit } = await searchParams;
  const [categories, editing] = await Promise.all([
    db.category.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, name: true, slug: true, sortOrder: true, status: true, updatedAt: true,
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    }),
    edit
      ? db.category.findUnique({
          where: { id: edit },
          select: {
            id: true, name: true, slug: true, description: true, sortOrder: true, status: true,
            seoTitle: true, seoDescription: true, seoKeywords: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader title="Categories" description="Product categories are fully dynamic — the website reads this list directly." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {categories.length === 0 ? (
            <EmptyState title="No categories" description="Create the first category to organize products." />
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id} className={edit === c.id ? "bg-primary-tint/50" : undefined}>
                      <TableCell>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-muted">/{c.slug}</p>
                      </TableCell>
                      <TableCell>{c._count.products}</TableCell>
                      <TableCell>{c.sortOrder}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <span className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/categories?edit=${c.id}`}
                            aria-label={`Edit ${c.name}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                          >
                            <Pencil aria-hidden className="size-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </Link>
                          <DeleteButton
                            action={deleteCategory}
                            id={c.id}
                            title="Delete category?"
                            description={`“${c.name}” will be removed. Categories holding products cannot be deleted.`}
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
        <CategoryForm key={editing?.id ?? "new"} initial={editing ?? undefined} />
      </div>
    </>
  );
}
