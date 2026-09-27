import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ServiceCard } from "@/components/website/service-card";
import { QuoteCta } from "@/components/website/quote-cta";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getServiceBySlug, getRelatedServices } from "@/lib/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return pageMetadata({
    title: service.seoTitle || service.name,
    description: service.seoDescription || service.shortDescription || `${service.name} — trade and professional services.`,
    path: `/services/${service.slug}`,
  });
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function asCta(value: unknown): { label: string; href: string } | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    if (typeof o.label === "string" && typeof o.href === "string") {
      return { label: o.label, href: o.href };
    }
  }
  return null;
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const related = await getRelatedServices(service.id, 3);
  const benefits = asStringList(service.benefits);
  const process = asStringList(service.process);
  const cta = asCta(service.cta);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb
            items={[{ label: "Services", href: "/services" }, { label: service.name }]}
          />
          <p className="text-xs font-bold tracking-[0.14em] text-secondary-dark uppercase">Service</p>
          <h1 className="max-w-3xl">{service.name}</h1>
          {service.shortDescription && (
            <p className="text-lead max-w-3xl">{service.shortDescription}</p>
          )}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link
              href={cta?.href ?? "/quote"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark"
            >
              {cta?.label ?? "Request this service"}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              Talk to our team
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            {service.description && (
              <div>
                <h2 className="text-2xl">Overview</h2>
                <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/90">{service.description}</p>
              </div>
            )}
            {benefits.length > 0 && (
              <div>
                <h2 className="text-2xl">Benefits</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
                      <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {process.length > 0 && (
              <div>
                <h2 className="text-2xl">How it works</h2>
                <ol className="mt-4 flex flex-col gap-3">
                  {process.map((step, i) => (
                    <li key={i} className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4">
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-extrabold text-primary"
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-base font-semibold">Discuss your requirements</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Every engagement starts with a written scope — no obligation.
              </p>
              <Link
                href="/quote"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                Request a Quote
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </aside>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-10 md:py-14">
          <Container className="flex flex-col gap-6">
            <h2 className="text-2xl">Related services</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <QuoteCta />
    </>
  );
}
