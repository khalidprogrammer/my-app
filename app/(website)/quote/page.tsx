import { Container, NarrowContainer } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { QuoteForm } from "@/components/website/quote-form";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getProducts, getProductBySlug } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "Request a Quote",
  description:
    "Request a quotation — product, quantity and destination. Our team reviews every request and replies with a written offer.",
  path: "/quote",
});

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product: productSlug } = await searchParams;

  const [{ items }, preselected] = await Promise.all([
    getProducts({ pageSize: 200 }),
    productSlug ? getProductBySlug(productSlug) : Promise.resolve(null),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "Request a Quote" }])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Request a Quote" }]} />
          <h1>Request a quotation</h1>
          <p className="text-lead max-w-3xl">
            Two short steps. We review every request by hand and reply with a written
            quotation — specifications, packaging and delivery terms included.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <NarrowContainer className="rounded-lg border border-border bg-surface p-6 md:p-8">
          <QuoteForm
            products={items.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))}
            initialProductSlug={preselected?.slug}
            initialProductName={preselected?.name}
          />
        </NarrowContainer>
      </section>
    </>
  );
}
