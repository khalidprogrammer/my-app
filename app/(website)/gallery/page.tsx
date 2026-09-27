import Link from "next/link";
import { Images } from "lucide-react";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { GalleryGrid } from "@/components/website/gallery-grid";
import { QuoteCta } from "@/components/website/quote-cta";
import { EmptyState } from "@/components/ui/states";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getGalleryAlbums, getGalleryItems } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Photo Gallery",
  description:
    "Operations in pictures — sourcing, warehousing, quality checks and shipping snapshots from our trade network.",
  path: "/gallery",
});

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  const { album: albumSlug } = await searchParams;
  const [albums, { photos, album }] = await Promise.all([
    getGalleryAlbums(),
    getGalleryItems(albumSlug),
  ]);

  const validFilter = !albumSlug || album !== null;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "Gallery" }])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Gallery" }]} />
          <p className="eyebrow-pill w-fit">In pictures</p>
          <h1>Operations gallery</h1>
          <p className="text-lead max-w-3xl">
            {album
              ? (album.description ?? `Photos from ${album.name}.`)
              : "Sourcing, warehousing, quality checks and shipping — browse by album."}
          </p>

          {albums.length > 1 && (
            <nav aria-label="Gallery albums" className="mt-1 flex flex-wrap gap-2">
              <Link
                href="/gallery"
                aria-current={!albumSlug ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold transition-colors",
                  !albumSlug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-ink hover:border-primary hover:text-primary",
                )}
              >
                All photos
              </Link>
              {albums.map((a) => {
                const active = album?.slug === a.slug;
                return (
                  <Link
                    key={a.id}
                    href={`/gallery?album=${a.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-ink hover:border-primary hover:text-primary",
                    )}
                  >
                    {a.name}
                    <span className={cn("text-xs font-bold", active ? "text-white/75" : "text-muted")}>
                      {a._count.items}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container className="flex flex-col gap-6">
          {!validFilter ? (
            <EmptyState
              title="Album not found"
              description="This album does not exist or is no longer published."
              actionLabel="View all photos"
              actionHref="/gallery"
            />
          ) : photos.length > 0 ? (
            <>
              <p className="text-sm text-muted" role="status">
                {photos.length} photo{photos.length === 1 ? "" : "s"}
                {album ? ` in ${album.name}` : " across all albums"} — select any photo to view it larger.
              </p>
              <GalleryGrid photos={photos} />
            </>
          ) : (
            <EmptyState
              icon={<Images aria-hidden className="size-6" />}
              title="No photos yet"
              description="New albums are published regularly. Meanwhile, browse the catalog or send an inquiry."
              actionLabel="Browse products"
              actionHref="/products"
            />
          )}
        </Container>
      </section>

      <QuoteCta />
    </>
  );
}
