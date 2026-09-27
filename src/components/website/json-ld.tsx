/**
 * JSON-LD structured data (PRD §8): Organization, WebSite, BreadcrumbList,
 * Product, Article. Only factual data — no reviews, prices, or ratings.
 * Rendered inside server components via <script type="application/ld+json">.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd(siteUrl: string, siteName: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description,
  };
}

export function websiteJsonLd(siteUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };
}

export function breadcrumbJsonLd(siteUrl: string, trail: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };
}

export function productJsonLd({
  siteUrl,
  path,
  name,
  description,
  sku,
  brand,
  categoryName,
  image,
}: {
  siteUrl: string;
  path: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  brand?: string | null;
  categoryName?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url: `${siteUrl}${path}`,
    ...(description ? { description } : {}),
    ...(sku ? { sku } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    ...(image ? { image: [image] } : {}),
  };
}

export function articleJsonLd({
  siteUrl,
  path,
  title,
  excerpt,
  publishedAt,
}: {
  siteUrl: string;
  path: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: Date | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url: `${siteUrl}${path}`,
    ...(excerpt ? { description: excerpt } : {}),
    ...(publishedAt ? { datePublished: publishedAt.toISOString() } : {}),
  };
}
