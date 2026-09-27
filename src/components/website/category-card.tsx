import Link from "next/link";
import {
  ArrowRight,
  Apple,
  Briefcase,
  Building,
  Car,
  Cog,
  Cpu,
  Factory,
  Monitor,
  Package,
  Plug,
  ShoppingBag,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "auto-parts": Car,
  "hardware-products": Wrench,
  "machinery-equipment": Cog,
  "machinery-parts-components": Factory,
  "electronic-products": Cpu,
  "building-materials": Building,
  "plastic-products": Package,
  "office-supplies": Briefcase,
  "daily-necessities": ShoppingBag,
  "mechanical-electrical-equipment": Zap,
  "power-facility-equipment-materials": Plug,
  "prepackaged-food": Apple,
  "technology-services": Monitor,
  "industrial-equipment": Cog,
  "default": Package,
};

/** CategoryCard — icon, name, short description, explore link. */
function CategoryCard({
  category,
}: {
  category: { name: string; slug: string; description: string | null; _count: { products: number } };
}) {
  const Icon = CATEGORY_ICONS[category.slug] ?? CATEGORY_ICONS["industrial-equipment"] ?? Package;
  const count = category._count.products;
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card-lift group flex h-full flex-col gap-3 border border-border bg-surface p-5 hover:border-primary/40"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon aria-hidden className="size-5" />
        </span>
        {count > 0 && (
          <span className="rounded-full bg-faint px-2.5 py-1 text-[11px] font-bold text-muted">
            {count} item{count === 1 ? "" : "s"}
          </span>
        )}
      </span>
      <span className="text-base font-semibold transition-colors group-hover:text-primary">
        {category.name}
      </span>
      <span className="line-clamp-2 text-sm leading-relaxed text-muted">
        {category.description ?? `Sourcing and supply for ${category.name.toLowerCase()}.`}
      </span>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-primary">
        Explore category
        <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export { CategoryCard, CATEGORY_ICONS };
export type { LucideIcon as CategoryIcon };
