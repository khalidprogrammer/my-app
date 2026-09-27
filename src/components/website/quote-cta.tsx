import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/website/container";
import { quoteHref } from "@/config/site";

/** QuoteCta — navy band closing public pages (design.md §5 CTA). */
function QuoteCta({
  title = "Tell us what you need to source.",
  description = "Share the product, quantity and destination — our team will prepare a quotation for your business.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-primary-ink">
      <div className="bg-dots-light">
        <Container className="flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center md:py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-secondary uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-secondary" />
              Free quotation
            </p>
            <h2 className="mt-3 text-white">{title}</h2>
            <p className="mt-2 leading-relaxed text-white/75">{description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={quoteHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-7 font-semibold text-secondary-foreground shadow-[0_10px_24px_-10px_rgba(217,154,43,0.9)] transition-all hover:bg-secondary-dark"
            >
              Request a Quote
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-7 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}

export { QuoteCta };
