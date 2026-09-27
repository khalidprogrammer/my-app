import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}

/** Standard SEO metadata for a public page (PRD §8). */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
  article,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  article?: { publishedTime?: string };
}): Metadata {
  const url = absoluteUrl(path);
  const desc = truncate(description);
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: siteConfig.name,
      ...(article ? { type: "article" as const, ...(article.publishedTime ? { publishedTime: article.publishedTime } : {}) } : { type: "website" as const }),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description: desc },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
