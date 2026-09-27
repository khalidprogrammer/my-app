import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container, NarrowContainer } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArticleCard, formatDate } from "@/components/website/article-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { JsonLd, breadcrumbJsonLd, articleJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return pageMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || article.title,
    path: `/news/${article.slug}`,
    ...(article.publishedAt ? { article: { publishedTime: article.publishedAt.toISOString() } } : {}),
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, article.categoryId, 3);
  const path = `/news/${article.slug}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(siteUrl, [
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: article.title },
          ]),
          articleJsonLd({
            siteUrl,
            path,
            title: article.title,
            excerpt: article.excerpt,
            publishedAt: article.publishedAt,
          }),
        ]}
      />

      <section className="border-b border-border bg-surface">
        <NarrowContainer className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb
            items={[
              { label: "News", href: "/news" },
              ...(article.category
                ? [{ label: article.category.name, href: `/news?category=${article.category.slug}` }]
                : []),
              { label: article.title },
            ]}
          />
          <h1>{article.title}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span>{formatDate(article.publishedAt, article.createdAt)}</span>
            {article.author && (
              <>
                <span aria-hidden>·</span>
                <span>By {article.author.name}</span>
              </>
            )}
            {article.category && (
              <>
                <span aria-hidden>·</span>
                <Link href={`/news?category=${article.category.slug}`} className="rounded font-semibold text-primary hover:underline">
                  {article.category.name}
                </Link>
              </>
            )}
          </p>
          {article.excerpt && <p className="text-lead">{article.excerpt}</p>}
        </NarrowContainer>
      </section>

      <section className="py-10 md:py-14">
        <NarrowContainer>
          <div className="leading-relaxed whitespace-pre-line text-ink/90">{article.content}</div>
        </NarrowContainer>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-10 md:py-14">
          <Container className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl">Related articles</h2>
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline"
              >
                All articles
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <QuoteCta />
    </>
  );
}
