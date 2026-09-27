import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "products.create")) return <AccessDenied />;

  const [categories, media] = await Promise.all([
    db.category.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    db.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, url: true, fileName: true, altText: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="New product" description="Add a product to the catalog. It stays a draft until published." />
      <ProductForm categories={categories} media={media} />
    </>
  );
}
