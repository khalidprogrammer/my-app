import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "success" }> = {
  IMPORT: { label: "Import", variant: "default" },
  EXPORT: { label: "Export", variant: "secondary" },
  BOTH: { label: "Import & Export", variant: "success" },
};

/** MarketCard — region with import/export indicator, no invented claims. */
function MarketCard({
  market,
}: {
  market: {
    name: string;
    slug: string;
    countryCode: string | null;
    type: "IMPORT" | "EXPORT" | "BOTH";
    description: string | null;
  };
}) {
  const type = TYPE_LABEL[market.type] ?? TYPE_LABEL.BOTH;
  return (
    <Link
      href={`/markets/${market.slug}`}
      className="card-lift group flex h-full flex-col gap-2.5 border border-border bg-surface p-5 hover:border-primary/40"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-tint text-sm font-extrabold text-secondary-dark"
        >
          {market.countryCode ?? market.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="font-semibold transition-colors group-hover:text-primary">{market.name}</span>
        <span className="ml-auto">
          <Badge variant={type.variant}>{type.label}</Badge>
        </span>
      </span>
      {market.description && (
        <span className="line-clamp-3 text-sm leading-relaxed text-muted">{market.description}</span>
      )}
      <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-primary">
        Market details
        <ArrowRight aria-hidden className="size-3.5" />
      </span>
    </Link>
  );
}

export { MarketCard };
