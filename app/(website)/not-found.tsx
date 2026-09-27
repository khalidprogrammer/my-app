import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/website/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-4 py-20 md:py-28">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1>Page not found</h1>
      <p className="text-lead max-w-xl">
        The page you are looking for has moved, or the item is no longer listed.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          Browse products
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </Container>
  );
}
