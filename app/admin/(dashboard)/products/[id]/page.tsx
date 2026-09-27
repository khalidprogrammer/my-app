import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "products.update")) return <AccessDenied />;

  const { id } = await params;
  const [product, categories, media] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { include: { media: true }, orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    }),
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
  if (!product || product.deletedAt) notFound();

  return (
    <>
      <PageHeader title={`Edit — ${product.name}`} description={`/${product.slug}`} />
      <ProductForm
        categories={categories}
        media={media}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          shortDescription: product.shortDescription,
          description: product.description,
          brand: product.brand,
          model: product.model,
          origin: product.origin,
          applications: product.applications,
          packaging: product.packaging,
          moq: product.moq?.toString() ?? null,
          unit: product.unit,
          featured: product.featured,
          status: product.status,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          seoKeywords: product.seoKeywords,
          specs: product.specs.map((s) => ({ name: s.name, value: s.value })),
          images: product.images.map((i) => ({ mediaId: i.mediaId, isPrimary: i.isPrimary })),
        }}
      />
    </>
  );
}
