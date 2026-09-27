import { notFound } from "next/navigation";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { MarketCard } from "@/components/website/market-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getMarketBySlug, getActiveMarkets } from "@/lib/queries";

const TYPE_LABEL: Record<string, string> = {
  IMPORT: "Import",
  EXPORT: "Export",
  BOTH: "Import & Export",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) return { title: "Market not found" };
  return pageMetadata({
    title: `${market.name} Market`,
    description:
      market.description || `Trade coverage for ${market.name} — import and export services.`,
    path: `/markets/${market.slug}`,
  });
}

export default async function MarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) notFound();

  const others = (await getActiveMarkets()).filter((m) => m.slug !== market.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [
          { label: "Home", href: "/" },
          { label: "Markets", href: "/markets" },
          { label: market.name },
        ])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Markets", href: "/markets" }, { label: market.name }]} />
          <div className="flex flex-wrap items-center gap-3">
            <h1>{market.name}</h1>
            <Badge variant="secondary">{TYPE_LABEL[market.type] ?? market.type}</Badge>
          </div>
          {market.description ? (
            <p className="text-lead max-w-3xl">{market.description}</p>
          ) : (
            <p className="text-lead max-w-3xl">
              Trade coverage for {market.name}. Contact us with your product and
              destination to confirm routing, packaging and delivery terms.
            </p>
          )}
        </Container>
      </section>

      {others.length > 0 && (
        <section className="py-10 md:py-14">
          <Container className="flex flex-col gap-6">
            <h2 className="text-2xl">Other markets</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <QuoteCta
        title={`Shipping to or from ${market.name}?`}
        description="Share the product, quantity and destination — we will confirm routing and prepare a quotation."
      />
    </>
  );
}
