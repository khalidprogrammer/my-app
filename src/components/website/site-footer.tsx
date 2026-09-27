import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ArrowRight, FileText } from "lucide-react";
import { Container } from "@/components/website/container";
import { mainNav, quoteHref, siteConfig } from "@/config/site";
import type { PublicContact } from "@/lib/queries";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94z" />
    </svg>
  );
}

const productLinks = [
  { label: "Auto Parts", href: "/products?category=auto-parts" },
  { label: "Machinery & Equipment", href: "/products?category=machinery-equipment" },
  { label: "Electronic Products", href: "/products?category=electronic-products" },
  { label: "Building Materials", href: "/products?category=building-materials" },
  { label: "All Products", href: "/products" },
];

const serviceLinks = [
  { label: "Import & Export", href: "/services/import-export" },
  { label: "Trade Agency", href: "/services/import-export-agency" },
  { label: "Supply Chain Management", href: "/services/supply-chain-management" },
  { label: "Freight Forwarding", href: "/services/freight-forwarding" },
  { label: "All Services", href: "/services" },
];

/**
 * SiteFooter — corporate footer: brand + contact, product/service
 * link columns, company column, legal bar.
 * Contact details come from live site settings (DB) via the layout prop.
 */
function SiteFooter({ contact }: { contact: PublicContact }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary-ink text-white">
      <div aria-hidden className="h-1 bg-gradient-to-r from-secondary via-secondary-dark to-secondary" />
      {/* Quote CTA strip */}
      <div className="border-b border-white/10">
        <div className="bg-dots-light">
          <Container className="flex flex-col items-start justify-between gap-5 py-10 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <span aria-hidden className="mt-1 hidden size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground sm:flex">
                <FileText className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white md:text-2xl">Need a quotation for your next shipment?</h2>
                <p className="mt-1 text-sm text-white/70">
                  Tell us the product, quantity and destination — our team replies promptly.
                </p>
              </div>
            </div>
          <Link
            href={quoteHref}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-dark"
          >
            Request a Quote
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          </Container>
        </div>
      </div>

      {/* Link columns */}
      <Container className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-extrabold tracking-tight">
            {siteConfig.name}
            <span className="text-secondary">.</span>
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
            {siteConfig.tagline}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{siteConfig.description}</p>
          <div className="mt-5 flex items-center gap-2">
            {[
              { label: "LinkedIn", Icon: LinkedInIcon, href: "#" },
              { label: "Facebook", Icon: FacebookIcon, href: "#" },
              { label: "Email", Icon: Mail, href: `mailto:${siteConfig.email}` },
            ].map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex size-9 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Products">
          <p className="text-sm font-bold tracking-wide text-white uppercase">Products</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {productLinks.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className="rounded text-white/70 transition-colors hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services">
          <p className="text-sm font-bold tracking-wide text-white uppercase">Services</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {serviceLinks.map((l) => (
              <li key={l.href + l.label}>
                <Link href={l.href} className="rounded text-white/70 transition-colors hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-bold tracking-wide text-white uppercase">Contact</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />
              {contact.address}
            </li>
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 rounded hover:text-white">
                <Phone aria-hidden className="size-4 shrink-0 text-secondary" />
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2.5 rounded hover:text-white">
                <Mail aria-hidden className="size-4 shrink-0 text-secondary" />
                {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock aria-hidden className="size-4 shrink-0 text-secondary" />
              {siteConfig.hours}
            </li>
          </ul>
        </div>
      </Container>

      {/* Legal bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-start justify-between gap-2 py-5 text-[13px] text-white/60 sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.name} {siteConfig.tagline}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex items-center gap-5">
            {mainNav.slice(0, 1).map((l) => (
              <Link key={l.href} href={l.href} className="rounded transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
            <Link href="/contact" className="rounded transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="rounded transition-colors hover:text-white">
              Terms
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}

export { SiteFooter };
