import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/website/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ContactForm } from "@/components/website/contact-form";
import { JsonLd, breadcrumbJsonLd } from "@/components/website/json-ld";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getPublicContact } from "@/lib/queries";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch — trade inquiries, product questions and partnership proposals. Address, phone, email and business hours.",
  path: "/contact",
});

export default async function ContactPage() {
  const contact = await getPublicContact();
  const INFO = [
    { Icon: MapPin, label: "Address", value: contact.address },
    { Icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    { Icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { Icon: Clock, label: "Business hours", value: siteConfig.hours },
  ];
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl, [{ label: "Home", href: "/" }, { label: "Contact" }])}
      />

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-4 py-10 md:py-14">
          <Breadcrumb items={[{ label: "Contact" }]} />
          <h1>Contact us</h1>
          <p className="text-lead max-w-3xl">
            Trade inquiries, product questions, partnership proposals — send a message
            and our team will reply during business hours.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {INFO.map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3.5 rounded-lg border border-border bg-surface p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-tint text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold tracking-wide text-muted uppercase">{label}</p>
                  {href ? (
                    <a href={href} className="mt-0.5 block rounded font-semibold hover:text-primary hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 font-semibold">{value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-surface p-5">
              <p className="text-sm font-bold tracking-wide text-muted uppercase">Prefer a quotation?</p>
              <a href="/quote" className="mt-0.5 block rounded font-semibold text-primary hover:underline">
                Go to the quotation request form →
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-6 md:p-8 lg:col-span-3">
            <h2 className="text-xl">Send a message</h2>
            <p className="mt-1 mb-6 text-sm text-muted">Fields marked * are required.</p>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
