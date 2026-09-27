import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import type { ProductCardData } from "@/lib/queries";

function productImageOf(p: ProductCardData) {
  const first = p.images[0];
  return first?.media ? { url: first.media.url, alt: first.media.altText ?? p.name } : null;
}

/**
 * ProductCard — design.md §5: image, name, category, short description,
 * View Details (no public prices — quote CTA instead).
 */
function ProductCard({ product }: { product: ProductCardData }) {
  const image = productImageOf(product);
  return (
    <article className="card-lift group flex h-full flex-col overflow-hidden border border-border bg-surface hover:border-primary/30">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-faint"
        aria-label={`View ${product.name}`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="bg-dots flex size-full items-center justify-center text-primary/30">
            <Package aria-hidden className="size-12" strokeWidth={1.25} />
          </span>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-secondary-foreground uppercase">
            Featured
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="text-xs font-bold tracking-wide text-secondary-dark uppercase">
          {product.category.name}
        </p>
        <h3 className="text-base leading-snug font-semibold">
          <Link href={`/products/${product.slug}`} className="rounded transition-colors group-hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{product.shortDescription}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
          >
            View Details
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link
            href={`/quote?product=${product.slug}`}
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-[13px] font-semibold text-ink transition-colors hover:border-secondary-dark hover:text-secondary-dark"
          >
            Request Quote
          </Link>
        </div>
      </div>
    </article>
  );
}

export { ProductCard, productImageOf };
