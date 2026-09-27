import { notFound } from "next/navigation";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/website/product-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { EmptyState } from "@/components/ui/states";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getCategoryBySlug, getProducts, PRODUCT_PAGE_SIZE } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return pageMetadata({
    title: `${category.name} Products`,
    description:
      category.seoDescription || category.description || `Browse ${category.name} — request quotations on industrial supply.`,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items, total } = await getProducts({ categorySlug: category.slug, pageSize: PRODUCT_PAGE_SIZE });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: category.name },
        ])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: category.name }]} />
          <h1>{category.name}</h1>
          <p className="text-lead max-w-3xl">
            {category.description ?? `Sourcing and supply for ${category.name.toLowerCase()}.`}
          </p>
          <p className="text-sm text-muted" role="status">
            {total === 0 ? "No products listed yet" : `${total} product${total === 1 ? "" : "s"}`}
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products in this category yet"
              description="New products are added regularly. Describe what you need and we will source it for you."
              actionLabel="Request a Quote"
              actionHref="/quote"
            />
          )}
        </Container>
      </section>

      <QuoteCta />
    </>
  );
}
