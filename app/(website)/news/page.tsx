import Link from "next/link";
import { Search, Newspaper } from "lucide-react";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArticleCard } from "@/components/website/article-card";
import { Pagination } from "@/components/website/pagination";
import { EmptyState } from "@/components/ui/states";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getArticles, getNewsCategories, ARTICLE_PAGE_SIZE } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "News & Updates",
  description:
    "Company news, trade insights and catalog updates from our team.",
  path: "/news",
});

type SearchParams = { q?: string; category?: string; page?: string };

function hrefFor(params: SearchParams, page: number) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (page > 1) sp.set("page", String(page));
  const s = sp.toString();
  return `/news${s ? `?${s}` : ""}`;
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const categorySlug = params.category || undefined;
  const page = Number.parseInt(params.page ?? "1", 10);

  const [{ items, total, totalPages, page: safePage, category }, categories] = await Promise.all([
    getArticles({ q, categorySlug, page, pageSize: ARTICLE_PAGE_SIZE }),
    getNewsCategories(),
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "News" }])} />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "News" }]} />
          <h1>News & updates</h1>
          <p className="text-lead max-w-3xl">
            {category ? `Articles in ${category.name}.` : "Company news, trade notes and catalog updates."}
          </p>

          <form method="get" action="/news" className="mt-2 flex flex-col gap-3 lg:flex-row" role="search">
            <label className="relative flex-1">
              <span className="sr-only">Search articles</span>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search articles…"
                className="h-11 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-sm transition-colors placeholder:text-muted/70 hover:border-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </label>
            {categories.length > 0 && (
              <label className="lg:w-64">
                <span className="sr-only">Filter by category</span>
                <select
                  name="category"
                  defaultValue={categorySlug ?? ""}
                  className="h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-3 text-sm transition-colors hover:border-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c._count.articles})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="submit"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Search
            </button>
          </form>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container className="flex flex-col gap-6">
          <p className="text-sm text-muted" role="status">
            {total === 0 ? "No articles found" : `${total} article${total === 1 ? "" : "s"}`}
          </p>
          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
              <Pagination page={safePage} totalPages={totalPages} buildHref={(p) => hrefFor(params, p)} />
            </>
          ) : (
            <EmptyState
              icon={<Newspaper aria-hidden className="size-6" />}
              title="No articles yet"
              description="We publish company news and trade notes here. Meanwhile, browse the catalog or send an inquiry."
              actionLabel="Browse products"
              actionHref="/products"
            />
          )}

          {categories.length > 0 && (
            <nav aria-label="Article categories" className="border-t border-border pt-6">
              <p className="mb-3 text-sm font-semibold">Browse by topic</p>
              <ul className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/news?category=${c.slug}`}
                      className="inline-flex rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </section>
    </>
  );
}
