import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, FileCheck2, Truck, Handshake, ClipboardList, Ship, MapPin, Package, Layers, Wrench } from "lucide-react";
import { Container } from "@/components/website/container";
import { SectionHeading } from "@/components/website/section-heading";
import { CategoryCard } from "@/components/website/category-card";
import { ProductCard } from "@/components/website/product-card";
import { ServiceCard } from "@/components/website/service-card";
import { MarketCard } from "@/components/website/market-card";
import { ArticleCard } from "@/components/website/article-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { Reveal } from "@/components/website/reveal";
import { HeroParticles } from "@/components/website/hero-particles";
import { ShowcaseCarousel, type ShowcaseSlide } from "@/components/website/showcase-carousel";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import {
  getActiveCategories,
  getFeaturedProducts,
  getPublishedServices,
  getActiveMarkets,
  getLatestArticles,
  getSiteStats,
} from "@/lib/queries";

export const metadata = pageMetadata({
  title: `${siteConfig.tagline} — Global Trade, Sourcing & Logistics`,
  description:
    "Import and export of industrial products, machinery, electronics and building materials — plus trade agency, supply-chain and technology services for buyers worldwide.",
  path: "/",
});

const WHY_US = [
  {
    Icon: Handshake,
    title: "Single sourcing partner",
    text: "One accountable contact across product categories, suppliers and shipments.",
  },
  {
    Icon: FileCheck2,
    title: "Documented quotations",
    text: "Clear specifications, packaging and delivery terms — confirmed in writing before you commit.",
  },
  {
    Icon: ShieldCheck,
    title: "Quality checkpoints",
    text: "Specification review and pre-shipment checks matched to the product at hand.",
  },
  {
    Icon: Truck,
    title: "Logistics coordination",
    text: "Freight forwarding and loading support arranged alongside your order.",
  },
];

export default async function Home() {
  const [categories, featured, services, markets, articles, stats] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(8),
    getPublishedServices(),
    getActiveMarkets(),
    getLatestArticles(3),
    getSiteStats(),
  ]);

  const statItems = [
    { value: stats.categories, label: "Product categories" },
    { value: stats.products, label: "Listed products" },
    { value: stats.services, label: "Trade services" },
    ...(stats.markets > 0 ? [{ value: stats.markets, label: "Served markets" }] : []),
  ];

  const heroStats = [
    { Icon: Layers, value: stats.categories, label: "Product Categories" },
    { Icon: Package, value: stats.products, label: "Listed Products" },
    { Icon: Wrench, value: stats.services, label: "Trade Services" },
  ];

  // Hero cinema slides — royalty-free Pixabay photography, hosted locally.
  const showcase: ShowcaseSlide[] = [
    {
      src: "/images/hero-port.jpg",
      alt: "Container ship at a cargo port",
      eyebrow: "Global sourcing",
      title: "Factory-direct industrial supply",
      text: "Machinery, parts, electronics and materials across every catalog category.",
      href: "/products",
      linkLabel: "Browse products",
    },
    {
      src: "/images/hero-warehouse.jpg",
      alt: "Warehouse shelves stocked with goods",
      eyebrow: "Consolidation & checks",
      title: "Specification review, pre-shipment checks",
      text: "Quality checkpoints matched to the product before anything ships.",
      href: "/services",
      linkLabel: "Our services",
    },
    {
      src: "/images/hero-containers.jpg",
      alt: "Cargo containers stacked at a port terminal",
      eyebrow: "Ship to your door",
      title: "Freight forwarding with every order",
      text: "Loading support and delivery terms arranged alongside your quotation.",
      href: "/quote",
      linkLabel: "Get a quote",
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(siteUrl, siteConfig.name, siteConfig.description),
          websiteJsonLd(siteUrl, siteConfig.name),
        ]}
      />

      {/* Hero — photo backdrop with atmospheric showcase */}
      <section id="home" aria-label="Introduction" className="relative overflow-hidden bg-primary-ink">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/images/hero-logistics-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary-ink via-primary-ink/85 to-primary-ink/35" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary-ink/70 to-transparent" />
        <div aria-hidden className="bg-grid-light absolute inset-0 opacity-70" />
        <HeroParticles />
        <Container className="relative grid grid-cols-1 items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase">
                <MapPin aria-hidden className="size-3.5 text-secondary" />
                Global Sourcing & Logistics
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-hero max-w-xl text-balance text-white">
                Reliable Sourcing,
                <br />
                Trading & <span className="text-secondary">Logistics</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="max-w-xl text-lg leading-relaxed text-white/75">
                A one-stop import & export partner — connecting products, technology
                and markets through dependable sourcing, quality checks and freight
                forwarding.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/quote"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-secondary px-8 text-base font-bold text-secondary-foreground shadow-[0_14px_30px_-10px_rgba(245,158,11,0.7)] transition-all hover:bg-secondary-dark active:scale-[0.97]"
                >
                  Get Your Free Quote
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
                >
                  See How It Works
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.97]"
                >
                  <Package aria-hidden className="size-5" />
                  Browse Products
                </Link>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <dl className="flex flex-wrap gap-x-8 gap-y-4">
                {heroStats.map(({ Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon aria-hidden className="size-5 shrink-0 text-secondary" />
                    <div className="flex items-baseline gap-1.5">
                      <dd className="font-display text-2xl font-extrabold text-white">{value}</dd>
                      <dt className="text-[13px] font-medium text-white/60">{label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={200} direction="scale" className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            <ShowcaseCarousel items={showcase} />
          </Reveal>
        </Container>
      </section>

      {/* Company introduction — PRD §5.1 */}
      <section className="py-14 md:py-20">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col items-start gap-4">
              <p className="eyebrow-pill">Who we are</p>
              <h2>An international trading company for industrial supply</h2>
            <p className="leading-relaxed text-muted">
              {siteConfig.name} covers import and export of industrial products —
              from auto parts and machinery to electronics and building materials —
              alongside trade agency, supply-chain, logistics and technology services.
            </p>
            <p className="leading-relaxed text-muted">
              Buyers work with one accountable partner: documented quotations,
              specification checks and coordinated delivery for every order.
            </p>
            <span className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                About the company
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                Contact details
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {statItems.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 bg-surface p-6">
                  <dd className="font-display text-3xl font-extrabold text-primary">{s.value}</dd>
                  <dt className="text-sm text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Business categories */}
      <section className="py-14 md:py-20">
        <Container className="flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we trade"
              title="Sectors we specialize in"
              description="A working catalog across industrial supply — every category links to live, searchable products."
              linkLabel="Browse all products"
              linkHref="/products"
              align="center"
            />
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((c, i) => (
              <Reveal key={c.id} className="h-full" delay={((i % 4) * 100) as 0 | 100 | 200 | 300}>
                <CategoryCard category={c} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products — only when the catalog has entries */}
      {featured.length > 0 && (
        <section className="border-y border-border bg-surface py-14 md:py-20">
          <Container className="flex flex-col gap-8">
            <Reveal>
              <SectionHeading
                eyebrow="Catalog"
                title="Featured products"
                description="A selection from the current catalog. Every inquiry receives a written quotation — no public price lists."
                linkLabel="View all products"
                linkHref="/products"
                align="center"
              />
            </Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <Reveal key={p.id} className="h-full" delay={((i % 4) * 100) as 0 | 100 | 200 | 300}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Services */}
      <section className="section-warm border-y border-border py-14 md:py-20">
        <Container className="flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              eyebrow="What we do"
              title="End-to-end trade services"
              description="Beyond products: agency, supply-chain, logistics and technology services for cross-border business."
              linkLabel="All services"
              linkHref="/services"
              align="center"
            />
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} className="h-full" delay={((i % 3) * 100) as 0 | 100 | 200}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works — four steps from request to delivery */}
      <section id="how-it-works" className="scroll-mt-24 py-14 md:py-20">
        <Container className="flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Four steps to your shipment"
              description="A proven process refined for international buyers — tell us what you need, we handle the rest."
              align="center"
            />
          </Reveal>
          <Reveal delay={100}>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: ClipboardList, title: "Share requirements", text: "Tell us the products, quantities and destination through the quote form." },
              { Icon: FileCheck2, title: "Receive a quotation", text: "Specifications, packaging and delivery terms confirmed in writing." },
              { Icon: ShieldCheck, title: "Checks & production", text: "Specification review and pre-shipment checks matched to the product." },
              { Icon: Ship, title: "Ship to your door", text: "Freight forwarding and loading support arranged with your order." },
            ].map(({ Icon, title, text }, i) => (
              <li key={title} className="card-lift relative flex flex-col gap-3 border border-border bg-surface p-6 hover:border-primary/30">
                <span className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span aria-hidden className="font-display text-4xl font-extrabold text-primary/10">
                    {i + 1}
                  </span>
                </span>
                <h3 className="text-lg">{title}</h3>
                <p className="text-sm leading-relaxed text-muted">{text}</p>
                {i === 0 && (
                  <Link
                    href="/quote"
                    className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-secondary-dark hover:underline"
                  >
                    Start step 1
                    <ArrowRight aria-hidden className="size-3.5" />
                  </Link>
                )}
              </li>
            ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      {/* Markets — only when markets are configured */}
      {markets.length > 0 && (
        <section className="border-y border-border bg-surface py-14 md:py-20">
          <Container className="flex flex-col gap-8">
            <Reveal>
              <SectionHeading
                eyebrow="Where we operate"
                title="Global markets"
                description="We connect suppliers and buyers across the international markets below."
                linkLabel="All markets"
                linkHref="/markets"
                align="center"
              />
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {markets.slice(0, 6).map((m, i) => (
                <Reveal key={m.id} className="h-full" delay={((i % 3) * 100) as 0 | 100 | 200}>
                  <MarketCard market={m} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Statistics — real database counts only */}
      <section className="bg-primary-ink py-14 md:py-20">
        <Container className="flex flex-col gap-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-secondary uppercase">
                <span aria-hidden className="size-1.5 rounded-full bg-secondary" />
                By the catalog
              </p>
              <h2 className="mt-3 text-white">A catalog you can verify</h2>
              <p className="mt-2 leading-relaxed text-white/70">
                Live figures from the current database — not marketing estimates.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
              {statItems.map((s) => (
                <div key={s.label} className="flex flex-col gap-1 bg-primary-ink p-6">
                  <dd className="font-display text-3xl font-extrabold text-white md:text-4xl">{s.value}</dd>
                  <dt className="text-sm text-white/65">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Why choose us */}
      <section className="section-warm border-b border-border py-14 md:py-20">
        <Container className="flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              eyebrow="Why work with us"
              title="Built for procurement teams"
              description="Straightforward processes for buyers who need dependable supply without surprises."
              align="center"
            />
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map(({ Icon, title, text }, i) => (
              <Reveal key={title} className="h-full" delay={((i % 4) * 100) as 0 | 100 | 200 | 300}>
                <div className="card-lift flex h-full flex-col gap-2.5 border border-border bg-surface p-5 hover:border-primary/30">
                <span
                  className={
                    i % 2 === 0
                      ? "flex size-10 items-center justify-center rounded-xl bg-primary-tint text-primary"
                      : "flex size-10 items-center justify-center rounded-xl bg-secondary-tint text-secondary-dark"
                  }
                >
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Latest news — only when articles exist */}
      {articles.length > 0 && (
        <section className="border-t border-border bg-surface py-14 md:py-20">
          <Container className="flex flex-col gap-8">
            <Reveal>
              <SectionHeading
                eyebrow="Updates"
                title="Latest news"
                linkLabel="All articles"
                linkHref="/news"
                align="center"
              />
            </Reveal>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {articles.map((a, i) => (
                <Reveal key={a.id} className="h-full" delay={((i % 3) * 100) as 0 | 100 | 200}>
                  <ArticleCard article={a} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <QuoteCta />
    </>
  );
}
