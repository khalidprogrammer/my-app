import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** ServiceCard — capability-focused, never generic-SaaS. */
function ServiceCard({
  service,
}: {
  service: { name: string; slug: string; shortDescription: string | null };
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="card-lift group flex h-full items-start gap-4 border border-border bg-surface p-5 hover:border-primary/40"
    >
      <span
        aria-hidden
        className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-lg font-extrabold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
      >
        {service.name.charAt(0)}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-semibold transition-colors group-hover:text-primary">{service.name}</span>
        {service.shortDescription && (
          <span className="line-clamp-2 text-sm leading-relaxed text-muted">{service.shortDescription}</span>
        )}
        <span className="inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-primary">
          Learn more
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}

export { ServiceCard };
