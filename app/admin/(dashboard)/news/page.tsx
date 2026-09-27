import Link from "next/link";
import { Plus, Pencil, Search } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { PageHeader, AccessDenied } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { TableScroll, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/website/pagination";
import { EmptyState } from "@/components/ui/states";
import { NewsCategoryForm } from "@/components/admin/news-category-form";
import { deleteArticle, deleteNewsCategory } from "@/actions/news";

export const metadata = { title: "News" };

const PAGE_SIZE = 15;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!hasPermission(ctx, "news.manage")) return <AccessDenied />;

  const params = await searchParams;
  const q = params.q ?? "";
  const statusParam = params.status ?? "";
  const categoryParam = params.category ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const status = (STATUSES as string[]).includes(statusParam) ? statusParam : "";

  const where = {
    deletedAt: null,
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(categoryParam ? { categoryId: categoryParam } : {}),
    ...(q.trim() ? { OR: [{ title: { contains: q.trim() } }, { excerpt: { contains: q.trim() } }] } : {}),
  };

  const [total, items, categories] = await Promise.all([
    db.newsArticle.count({ where }),
    db.newsArticle.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    db.newsCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, slug: true,
        _count: { select: { articles: { where: { deletedAt: null } } } },
      },
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (categoryParam) sp.set("category", categoryParam);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/admin/news${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="News"
        description={`${total} article${total === 1 ? "" : "s"}. Topics organize the public news page.`}
        actions={
          <Link
            href="/admin/news/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            <Plus aria-hidden className="size-4" />
            New article
          </Link>
        }
      />

      <form method="get" action="/admin/news" role="search" className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search articles</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search title or excerpt…"
            className="h-10 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Filter by status</span>
          <select name="status" defaultValue={status} className="h-10 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Filter by topic</span>
          <select name="category" defaultValue={categoryParam} className="h-10 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none">
            <option value="">All topics</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="inline-flex h-10 cursor-pointer items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
          Filter
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState title="No articles found" description="Write the first article to start the news section." />
      ) : (
        <TableScroll>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-xs text-muted">/{a.slug}{a.author ? ` · ${a.author.name}` : ""}</p>
                  </TableCell>
                  <TableCell>{a.category?.name ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="whitespace-nowrap">
                    {a.publishedAt
                      ? a.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/news/${a.id}`}
                        aria-label={`Edit ${a.title}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-tint"
                      >
                        <Pencil aria-hidden className="size-3.5" />
                        <span className="hidden xl:inline">Edit</span>
                      </Link>
                      <DeleteButton
                        action={deleteArticle}
                        id={a.id}
                        title="Delete article?"
                        description={`“${a.title}” will be removed from the website.`}
                      />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      )}
      <Pagination page={page} totalPages={totalPages} buildHref={hrefFor} />

      {/* Topic manager */}
      <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3" aria-label="Topics">
        <div className="rounded-lg border border-border bg-surface xl:col-span-2">
          <h2 className="border-b border-border px-5 py-3.5 text-base font-semibold">Topics</h2>
          {categories.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">No topics yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="text-xs text-muted">/{c.slug}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{c._count.articles} article{c._count.articles === 1 ? "" : "s"}</Badge>
                    <DeleteButton
                      action={deleteNewsCategory}
                      id={c.id}
                      title="Delete topic?"
                      description={`“${c.name}” will be removed. Topics holding articles cannot be deleted.`}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <NewsCategoryForm />
      </section>
    </>
  );
}
