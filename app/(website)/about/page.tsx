import Link from "next/link";
import { Target, Eye, Compass, ArrowRight } from "lucide-react";
import { Container, NarrowContainer } from "@/components/website/container";
import { SectionHeading } from "@/components/website/section-heading";
import { CategoryCard } from "@/components/website/category-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { QuoteCta } from "@/components/website/quote-cta";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getActiveCategories, getActiveMarkets } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "An international trading company covering industrial products, machinery, electronics and building materials — with trade agency, supply-chain and technology services.",
  path: "/about",
});

const ADVANTAGES = [
  "Category-spanning sourcing from a single point of contact",
  "Written quotations with specifications, packaging and delivery terms",
  "Pre-shipment checks matched to the product at hand",
  "Freight forwarding and loading support alongside orders",
  "Bilingual trade documentation support",
];

export default async function AboutPage() {
  const [categories, markets] = await Promise.all([getActiveCategories(), getActiveMarkets()]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [
          { label: "Home", href: "/" },
          { label: "About" },
        ])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "About" }]} />
          <h1>About our trading company</h1>
          <p className="text-lead max-w-3xl">
            We are an international trading company connecting manufacturers with buyers
            across industrial supply — products, technology services and the logistics
            to move them.
          </p>
        </Container>
      </section>

      {/* Mission & vision */}
      <section className="py-12 md:py-16">
        <Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 md:p-8">
            <span className="flex size-11 items-center justify-center rounded-md bg-primary-tint text-primary">
              <Target aria-hidden className="size-5" />
            </span>
            <h2 className="text-2xl">Our mission</h2>
            <p className="leading-relaxed text-muted">
              Make cross-border sourcing straightforward: verified specifications, honest
              quotations and coordinated delivery for every order, large or small.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 md:p-8">
            <span className="flex size-11 items-center justify-center rounded-md bg-secondary-tint text-secondary-dark">
              <Eye aria-hidden className="size-5" />
            </span>
            <h2 className="text-2xl">Our vision</h2>
            <p className="leading-relaxed text-muted">
              A supply network where buyers can source industrial products and
              technology services through one dependable partner.
            </p>
          </div>
        </Container>
      </section>

      {/* Business scope — driven by the live category catalog */}
      <section className="border-y border-border bg-surface py-12 md:py-16">
        <Container className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Business scope"
            title="What we trade and handle"
            description="Our live catalog, grouped by business category. Select any card to see its products."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
          <p>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline"
            >
              <Compass aria-hidden className="size-4" />
              See our trade and professional services
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </p>
        </Container>
      </section>

      {/* Advantages + coverage */}
      <section className="py-12 md:py-16">
        <NarrowContainer className="flex flex-col gap-10">
          <div>
            <h2>Why buyers work with us</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {ADVANTAGES.map((a) => (
                <li key={a} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" />
                  <span className="leading-relaxed">{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Geographic coverage</h2>
            {markets.length > 0 ? (
              <>
                <p className="mt-3 leading-relaxed text-muted">
                  We currently serve the following markets:
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {markets.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/markets/${m.slug}`}
                        className="inline-flex rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                      >
                        {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 leading-relaxed text-muted">
                We arrange shipments internationally on a per-order basis. Share your
                destination in a quotation request and we will confirm routing,
                packaging and delivery terms for that lane.
              </p>
            )}
          </div>
        </NarrowContainer>
      </section>

      <QuoteCta />
    </>
  );
}
