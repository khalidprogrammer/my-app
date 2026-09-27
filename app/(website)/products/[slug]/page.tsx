import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { StatusBadge } from "@/components/ui/badge";
import { ProductCard } from "@/components/website/product-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl, absoluteUrl } from "@/lib/seo";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return pageMetadata({
    title: product.seoTitle || product.name,
    description:
      product.seoDescription || product.shortDescription || `${product.name} — request a quotation.`,
    path: `/products/${product.slug}`,
    image: product.images[0]?.media.url,
  });
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-0 sm:flex-row sm:gap-4">
      <dt className="w-40 shrink-0 text-sm font-semibold text-muted">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const path = `/products/${product.slug}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name },
          ]),
          productJsonLd({
            siteUrl,
            path,
            name: product.name,
            description: product.shortDescription,
            sku: product.sku,
            brand: product.brand,
            categoryName: product.category.name,
            image: primaryImage ? absoluteUrl(primaryImage.media.url) : undefined,
          }),
        ]}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-5 py-8 md:py-10">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              { label: product.category.name, href: `/categories/${product.category.slug}` },
              { label: product.name },
            ]}
          />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <div className="flex flex-col gap-3">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-border bg-faint">
                {primaryImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.media.url}
                    alt={primaryImage.media.altText ?? product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <Package aria-hidden className="size-16 text-muted/40" strokeWidth={1} />
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((img) => (
                    <div
                      key={img.id}
                      className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-faint"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.media.url}
                        alt={img.media.altText ?? product.name}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Information — design.md §8 */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold tracking-wide text-secondary-dark uppercase">
                  <Link href={`/categories/${product.category.slug}`} className="rounded hover:underline">
                    {product.category.name}
                  </Link>
                </p>
                <h1 className="mt-1.5 text-3xl md:text-4xl">{product.name}</h1>
                {product.shortDescription && (
                  <p className="text-lead mt-2">{product.shortDescription}</p>
                )}
              </div>

              <dl className="rounded-lg border border-border bg-background p-4">
                {product.sku && <SpecRow label="SKU" value={product.sku} />}
                {product.brand && <SpecRow label="Brand" value={product.brand} />}
                {product.model && <SpecRow label="Model" value={product.model} />}
                {product.origin && <SpecRow label="Origin" value={product.origin} />}
                {product.moq != null && (
                  <SpecRow label="MOQ" value={`${product.moq.toString()}${product.unit ? ` ${product.unit}` : ""}`} />
                )}
                {product.packaging && <SpecRow label="Packaging" value={product.packaging} />}
                <div className="flex items-center justify-between pt-2.5">
                  <dt className="text-sm font-semibold text-muted">Availability</dt>
                  <dd>
                    <StatusBadge status="published" label="Available on request" />
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/quote?product=${product.slug}`}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-secondary px-7 font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark"
                >
                  Request a Quote
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-md border border-border bg-surface px-7 font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  Contact Supplier
                </Link>
              </div>
              <p className="text-small text-muted">
                Pricing is quoted per order — quantity, packaging and destination affect the final offer.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Description / specifications / applications */}
      <section className="py-10 md:py-14">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            {product.description && (
              <div>
                <h2 className="text-2xl">Description</h2>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/90">{product.description}</p>
              </div>
            )}
            {product.specs.length > 0 && (
              <div>
                <h2 className="text-2xl">Specifications</h2>
                <dl className="mt-3 overflow-hidden rounded-lg border border-border bg-surface">
                  {product.specs.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-1 gap-0.5 border-b border-border px-4 py-3 last:border-0 sm:grid-cols-3 sm:gap-4"
                    >
                      <dt className="text-sm font-semibold text-muted">{s.name}</dt>
                      <dd className="text-sm sm:col-span-2">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {product.applications && (
              <div>
                <h2 className="text-2xl">Applications</h2>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/90">{product.applications}</p>
              </div>
            )}
          </div>
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-base font-semibold">Need this product?</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Send the quantity and destination port for a written quotation.
              </p>
              <Link
                href={`/quote?product=${product.slug}`}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Request a Quote
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </aside>
        </Container>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-10 md:py-14">
          <Container className="flex flex-col gap-6">
            <h2 className="text-2xl">Related products</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <QuoteCta />
    </>
  );
}
