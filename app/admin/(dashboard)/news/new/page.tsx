import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "New Article" };

export default async function NewArticlePage() {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "news.manage")) return <AccessDenied />;

  const categories = await db.newsCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageHeader title="New article" description="Drafts stay hidden until published." />
      <ArticleForm categories={categories} />
    </>
  );
}
