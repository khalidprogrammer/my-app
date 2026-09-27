import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MarketCard } from "@/components/website/market-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { EmptyState } from "@/components/ui/states";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getActiveMarkets } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "Global Markets",
  description:
    "The international markets we serve — import and export lanes connecting suppliers and buyers.",
  path: "/markets",
});

export default async function MarketsPage() {
  const markets = await getActiveMarkets();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "Markets" }])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Markets" }]} />
          <h1>Global markets</h1>
          <p className="text-lead max-w-3xl">
            We connect suppliers and buyers across key international markets — shown
            below exactly as configured. We never claim lanes we do not serve.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          {markets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Market coverage is confirmed per order"
              description="We arrange shipments internationally on a per-order basis. Share your destination in a quotation request and we will confirm routing and delivery terms for that lane."
              actionLabel="Request a Quote"
              actionHref="/quote"
            />
          )}
        </Container>
      </section>

      <QuoteCta />
    </>
  );
}
