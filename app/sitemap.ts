import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/seo";

/** Dynamic sitemap from live catalog data (PRD §8). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, services, markets, articles] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    db.service.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    db.market.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    db.newsArticle.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/products",
    "/services",
    "/markets",
    "/gallery",
    "/news",
    "/contact",
    "/quote",
  ].map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" as const }));

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${siteUrl}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...categories.map((c) => ({
      url: `${siteUrl}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...services.map((s) => ({
      url: `${siteUrl}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
    })),
    ...markets.map((m) => ({
      url: `${siteUrl}/markets/${m.slug}`,
      lastModified: m.updatedAt,
      changeFrequency: "monthly" as const,
    })),
    ...articles.map((a) => ({
      url: `${siteUrl}/news/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
