"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Container } from "@/components/website/container";

/**
 * Global error boundary (production resilience): a section crash shows
 * this fallback instead of a blank page, with a retry action.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Unhandled section error:", error);
  }, [error]);

  return (
    <Container className="flex flex-col items-start gap-4 py-20 md:py-28">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger">
        <AlertTriangle aria-hidden className="size-6" />
      </span>
      <h1>Something went wrong</h1>
      <p className="text-lead max-w-xl">
        This section failed to load. Please try again — if the problem persists,
        contact us directly.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <Home aria-hidden className="size-4" />
          Back to home
        </Link>
      </div>
    </Container>
  );
}
