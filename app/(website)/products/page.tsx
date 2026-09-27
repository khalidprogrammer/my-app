import Link from "next/link";
import { Search, PackageSearch } from "lucide-react";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/website/product-card";
import { Pagination } from "@/components/website/pagination";
import { EmptyState } from "@/components/ui/states";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getProducts, getActiveCategories, type ProductSort } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Searchable catalog of industrial products — auto parts, machinery, electronics, building materials and more. Filter by category and request a quotation.",
  path: "/products",
});

type SearchParams = { q?: string; category?: string; sort?: string; page?: string };

function hrefFor(params: SearchParams, page: number) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  if (page > 1) sp.set("page", String(page));
  const s = sp.toString();
  return `/products${s ? `?${s}` : ""}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const categorySlug = params.category || undefined;
  const sort: ProductSort = params.sort === "name" ? "name" : "newest";
  const page = Number.parseInt(params.page ?? "1", 10);

  const [{ items, total, totalPages, page: safePage, category }, categories] = await Promise.all([
    getProducts({ q, categorySlug, sort, page }),
    getActiveCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "Products" }])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Products" }]} />
          <h1>Product catalog</h1>
          <p className="text-lead max-w-3xl">
            {category
              ? `Browsing ${category.name} — refine with search or switch category.`
              : "Search the catalog, filter by business category, and request a quotation on anything you need."}
          </p>

          {/* Search + filters (plain GET form — no JS required) */}
          <form method="get" action="/products" className="mt-2 flex flex-col gap-3 lg:flex-row" role="search">
            <label className="relative flex-1">
              <span className="sr-only">Search products</span>
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search by name, SKU or brand…"
                className="h-11 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-sm transition-colors placeholder:text-muted/70 hover:border-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </label>
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
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="lg:w-48">
              <span className="sr-only">Sort products</span>
              <select
                name="sort"
                defaultValue={sort}
                className="h-11 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-3 text-sm transition-colors hover:border-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
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
            {total === 0
              ? "No products found"
              : `${total} product${total === 1 ? "" : "s"}${q ? ` matching “${q}”` : ""}${category ? ` in ${category.name}` : ""}`}
          </p>

          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={safePage} totalPages={totalPages} buildHref={(p) => hrefFor(params, p)} />
            </>
          ) : (
            <EmptyState
              icon={<PackageSearch aria-hidden className="size-6" />}
              title={q || categorySlug ? "No products match your search" : "The catalog is being stocked"}
              description={
                q || categorySlug
                  ? "Try a different keyword, or browse another category."
                  : "New products are added regularly. Send a quotation request describing what you need and we will source it."
              }
              actionLabel={q || categorySlug ? "Clear search" : "Request a Quote"}
              actionHref={q || categorySlug ? "/products" : "/quote"}
            />
          )}

          {categories.length > 0 && (
            <nav aria-label="Categories" className="border-t border-border pt-6">
              <p className="mb-3 text-sm font-semibold">Browse by category</p>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href="/products"
                    className="inline-flex rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
                  >
                    All
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/categories/${c.slug}`}
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
