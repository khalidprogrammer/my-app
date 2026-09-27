import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Edit Article" };

function toInputValue(d: Date | null): string | null {
  if (!d) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "news.manage")) return <AccessDenied />;

  const { id } = await params;
  const [article, categories] = await Promise.all([
    db.newsArticle.findUnique({
      where: { id },
      select: {
        id: true, title: true, slug: true, categoryId: true, excerpt: true, content: true,
        status: true, publishedAt: true, seoTitle: true, seoDescription: true, seoKeywords: true,
        deletedAt: true,
      },
    }),
    db.newsCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!article || article.deletedAt) notFound();

  return (
    <>
      <PageHeader title={`Edit — ${article.title}`} description={`/${article.slug}`} />
      <ArticleForm
        categories={categories}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          categoryId: article.categoryId,
          excerpt: article.excerpt,
          content: article.content,
          status: article.status,
          publishedAt: toInputValue(article.publishedAt),
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          seoKeywords: article.seoKeywords,
        }}
      />
    </>
  );
}
