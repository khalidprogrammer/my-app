/**
 * Site-wide content configuration.
 * Company details are placeholders — replace with real business data.
 * Navigation matches Architecture.md public routes + design.md §4 header.
 */
export const siteConfig = {
  name: "YANHENG INTERNATIONAL TRADE .",
  shortName: "YanHeng",
  tagline: "Import & Export",
  description:
    "Dependable international trade solutions — products, technology and supply-chain services for buyers worldwide.",
  email: "info@yanhenginternational.com",
  phone: "",
  address: "Your business address here",
  hours: "Mon–Fri, 9:00–18:00 (GMT+8)",
};

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Markets", href: "/markets" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export const quoteHref = "/quote";
