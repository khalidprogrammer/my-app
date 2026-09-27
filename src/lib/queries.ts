import { cache } from "react";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { siteConfig } from "@/config/site";

/**
 * Read queries for the public website (Phase 3).
 * Visibility rules: only PUBLISHED products/services/articles,
 * ACTIVE categories/markets, and never soft-deleted rows.
 */

export const PRODUCT_PAGE_SIZE = 12;
export const ARTICLE_PAGE_SIZE = 9;

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  brand: true,
  shortDescription: true,
  featured: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  images: {
    select: {
      isPrimary: true,
      sortOrder: true,
      media: { select: { url: true, altText: true } },
    },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] as const,
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

/* ------------------------------ Categories ------------------------------ */

export async function getActiveCategories() {
  return db.category.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      _count: {
        select: { products: { where: { status: "PUBLISHED", deletedAt: null } } },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug, status: "ACTIVE", deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
}

/* ------------------------------- Products ------------------------------- */

export type ProductSort = "newest" | "name";

export async function getProducts({
  q,
  categorySlug,
  sort = "newest",
  page = 1,
  pageSize = PRODUCT_PAGE_SIZE,
}: {
  q?: string;
  categorySlug?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}) {
  let category: { id: string; name: string; slug: string } | null = null;
  if (categorySlug) {
    category = await db.category.findFirst({
      where: { slug: categorySlug, status: "ACTIVE", deletedAt: null },
      select: { id: true, name: true, slug: true },
    });
    if (!category) return { items: [], total: 0, totalPages: 0, page: 1, category: null };
  }

  const term = q?.trim();
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
    ...(category ? { categoryId: category.id } : {}),
    ...(term
      ? {
          OR: [
            { name: { contains: term } },
            { sku: { contains: term } },
            { brand: { contains: term } },
            { shortDescription: { contains: term } },
          ],
        }
      : {}),
  };

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: sort === "name" ? { name: "asc" } : { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      select: productCardSelect,
    }),
  ]);

  return {
    items,
    total,
    totalPages: Math.ceil(total / pageSize),
    page: safePage,
    category,
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: {
        include: { media: true },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      specs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, take = 4) {
  return db.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, categoryId, NOT: { id: productId } },
    orderBy: { createdAt: "desc" },
    take,
    select: productCardSelect,
  });
}

export async function getFeaturedProducts(take = 8): Promise<ProductCardData[]> {
  const featured = await db.product.findMany({
    where: { status: "PUBLISHED", deletedAt: null, featured: true },
    orderBy: { createdAt: "desc" },
    take,
    select: productCardSelect,
  });
  if (featured.length >= take) return featured;
  const rest = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      NOT: { id: { in: featured.map((p) => p.id) } },
    },
    orderBy: { createdAt: "desc" },
    take: take - featured.length,
    select: productCardSelect,
  });
  return [...featured, ...rest];
}

/* ------------------------------- Services ------------------------------- */

export async function getPublishedServices() {
  return db.service.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      sortOrder: true,
    },
  });
}

export async function getServiceBySlug(slug: string) {
  return db.service.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      benefits: true,
      process: true,
      cta: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
}

export async function getRelatedServices(serviceId: string, take = 3) {
  return db.service.findMany({
    where: { status: "PUBLISHED", deletedAt: null, NOT: { id: serviceId } },
    orderBy: { sortOrder: "asc" },
    take,
    select: { id: true, name: true, slug: true, shortDescription: true },
  });
}

/* -------------------------------- Markets ------------------------------- */

export async function getActiveMarkets() {
  return db.market.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      countryCode: true,
      type: true,
      description: true,
    },
  });
}

export async function getMarketBySlug(slug: string) {
  return db.market.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      countryCode: true,
      type: true,
      description: true,
    },
  });
}

/* --------------------------------- News --------------------------------- */

const articleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  author: { select: { name: true } },
} satisfies Prisma.NewsArticleSelect;

export type ArticleCardData = Prisma.NewsArticleGetPayload<{ select: typeof articleCardSelect }>;

export async function getNewsCategories() {
  return db.newsCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { articles: { where: { status: "PUBLISHED", deletedAt: null } } } },
    },
  });
}

export async function getArticles({
  q,
  categorySlug,
  page = 1,
  pageSize = ARTICLE_PAGE_SIZE,
}: {
  q?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  let category: { id: string; name: string; slug: string } | null = null;
  if (categorySlug) {
    category = await db.newsCategory.findFirst({
      where: { slug: categorySlug },
      select: { id: true, name: true, slug: true },
    });
    if (!category) return { items: [], total: 0, totalPages: 0, page: 1, category: null };
  }

  const term = q?.trim();
  const where: Prisma.NewsArticleWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
    ...(category ? { categoryId: category.id } : {}),
    ...(term ? { OR: [{ title: { contains: term } }, { excerpt: { contains: term } }] } : {}),
  };

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const [total, items] = await Promise.all([
    db.newsArticle.count({ where }),
    db.newsArticle.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      select: articleCardSelect,
    }),
  ]);

  return { items, total, totalPages: Math.ceil(total / pageSize), page: safePage, category };
}

export async function getLatestArticles(take = 3) {
  return db.newsArticle.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
    select: articleCardSelect,
  });
}

export async function getArticleBySlug(slug: string) {
  return db.newsArticle.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { name: true } },
    },
  });
}

export async function getRelatedArticles(articleId: string, categoryId: string | null, take = 3) {
  return db.newsArticle.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      NOT: { id: articleId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
    select: articleCardSelect,
  });
}

/* --------------------------------- Stats -------------------------------- */
/** Honest counts straight from the database — no invented figures. */
export async function getSiteStats() {
  const [categories, products, services, markets, articles] = await Promise.all([
    db.category.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.product.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    db.service.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    db.market.count({ where: { status: "ACTIVE" } }),
    db.newsArticle.count({ where: { status: "PUBLISHED", deletedAt: null } }),
  ]);
  return { categories, products, services, markets, articles };
}

/* -------------------------------- Gallery ------------------------------- */

export async function getGalleryAlbums() {
  return db.galleryAlbum.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      cover: { select: { url: true, altText: true } },
      _count: { select: { items: true } },
    },
  });
}

export type GalleryPhoto = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  albumName: string;
};

export async function getGalleryItems(albumSlug?: string): Promise<{ photos: GalleryPhoto[]; album: { id: string; name: string; slug: string; description: string | null } | null }> {
  let album: { id: string; name: string; slug: string; description: string | null } | null = null;
  if (albumSlug) {
    album = await db.galleryAlbum.findFirst({
      where: { slug: albumSlug, status: "ACTIVE" },
      select: { id: true, name: true, slug: true, description: true },
    });
    if (!album) return { photos: [], album: null };
  }

  const items = await db.galleryItem.findMany({
    where: { album: { status: "ACTIVE" }, ...(album ? { albumId: album.id } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      caption: true,
      media: { select: { url: true, altText: true, fileName: true } },
      album: { select: { name: true } },
    },
  });

  return {
    photos: items.map((i) => ({
      id: i.id,
      url: i.media.url,
      alt: i.media.altText ?? i.caption ?? i.media.fileName,
      caption: i.caption,
      albumName: i.album.name,
    })),
    album,
  };
}

/* ------------------------------ Site settings --------------------------- */
/**
 * Public contact details: database first, hardcoded config as fallback.
 * Request-cached so header/footer/page share one query per render.
 */
export type PublicContact = { email: string; phone: string; address: string };

export const getPublicContact = cache(async (): Promise<PublicContact> => {
  const rows = await db.siteSetting.findMany({
    where: { key: { in: ["company_email", "company_phone", "company_address"] } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((r) => [r.key, (r.value ?? "").trim()]));
  return {
    email: map.get("company_email") || siteConfig.email,
    phone: map.get("company_phone") || siteConfig.phone,
    address: map.get("company_address") || siteConfig.address,
  };
});
