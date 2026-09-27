import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ArticleCardData } from "@/lib/queries";

function formatDate(d: Date | null, fallback: Date) {
  return (d ?? fallback).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** ArticleCard — excerpt list item for news pages and homepage. */
function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="card-lift group flex h-full flex-col gap-2 border border-border bg-surface p-5 hover:border-primary/40">
      <p className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {article.category && (
          <Link
            href={`/news?category=${article.category.slug}`}
            className="rounded text-secondary-dark hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        <span className="font-normal text-muted">{formatDate(article.publishedAt, article.createdAt)}</span>
      </p>
      <h3 className="text-base leading-snug font-semibold">
        <Link href={`/news/${article.slug}`} className="rounded transition-colors group-hover:text-primary">
          {article.title}
        </Link>
      </h3>
      {article.excerpt && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{article.excerpt}</p>
      )}
      <Link
        href={`/news/${article.slug}`}
        className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-primary hover:underline"
      >
        Read article
        <ArrowRight aria-hidden className="size-3.5" />
      </Link>
    </article>
  );
}

export { ArticleCard, formatDate };
