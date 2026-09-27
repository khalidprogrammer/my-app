import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { ServiceForm } from "@/components/admin/service-form";
import { deleteService } from "@/actions/services";

export const metadata = { title: "Services" };

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asCta(value: unknown): { label: string | null; href: string | null } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    return {
      label: typeof o.label === "string" ? o.label : null,
      href: typeof o.href === "string" ? o.href : null,
    };
  }
  return { label: null, href: null };
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "services.manage")) return <AccessDenied />;

  const { edit } = await searchParams;
  const [services, editingRaw] = await Promise.all([
    db.service.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, sortOrder: true, status: true, updatedAt: true },
    }),
    edit
      ? db.service.findUnique({
          where: { id: edit },
          select: {
            id: true, name: true, slug: true, shortDescription: true, description: true,
            benefits: true, process: true, cta: true, sortOrder: true, status: true,
            seoTitle: true, seoDescription: true, seoKeywords: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const editing = editingRaw
    ? {
        ...editingRaw,
        benefits: asStringList(editingRaw.benefits),
        process: asStringList(editingRaw.process),
        ...asCta(editingRaw.cta),
        cta: undefined,
      }
    : null;

  return (
    <>
      <PageHeader title="Services" description="Capability pages for trade, logistics and professional services." />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <div className="flex flex-col gap-4 xl:col-span-3">
          {services.length === 0 ? (
            <EmptyState title="No services" description="Create the first service page." />
          ) : (
            <TableScroll>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s) => (
                    <TableRow key={s.id} className={edit === s.id ? "bg-primary-tint/50" : undefined}>
                      <TableCell>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-muted">/{s.slug}</p>
                      </TableCell>
                      <TableCell>{s.sortOrder}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell>
                        <span className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/services?edit=${s.id}`}
                            aria-label={`Edit ${s.name}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                          >
                            <Pencil aria-hidden className="size-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </Link>
                          <DeleteButton
                            action={deleteService}
                            id={s.id}
                            title="Delete service?"
                            description={`“${s.name}” will be removed from the website.`}
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
        <div className="xl:col-span-2">
          <ServiceForm
            key={editing?.id ?? "new"}
            initial={
              editing
                ? {
                    id: editing.id, name: editing.name, slug: editing.slug,
                    shortDescription: editing.shortDescription, description: editing.description,
                    benefits: editing.benefits, process: editing.process,
                    ctaLabel: editing.label, ctaHref: editing.href,
                    sortOrder: editing.sortOrder, status: editing.status,
                    seoTitle: editing.seoTitle, seoDescription: editing.seoDescription, seoKeywords: editing.seoKeywords,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
