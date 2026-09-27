import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeading } from "@/components/website/section-heading";
import { ServiceCard } from "@/components/website/service-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getPublishedServices } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Trade and professional services — import and export, trade agency, supply-chain management, freight forwarding, technology services and more.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "Services" }])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Services" }]} />
          <h1>Trade and professional services</h1>
          <p className="text-lead max-w-3xl">
            Capabilities for cross-border business — from moving goods to moving
            technology and ideas.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container className="flex flex-col gap-8">
          <SectionHeading
            eyebrow={`${services.length} service${services.length === 1 ? "" : "s"}`}
            title="What we can do for your business"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </Container>
      </section>

      <QuoteCta
        title="Need a service combination?"
        description="Many orders mix sourcing, agency and logistics. Describe the outcome you need and we will scope it."
      />
    </>
  );
}
