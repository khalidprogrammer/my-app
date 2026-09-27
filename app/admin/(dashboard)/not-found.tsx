import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Admin 404 — stays inside the dashboard shell (no public chrome). */
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-8">
      <p className="text-4xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl">Admin page not found</h1>
      <p className="text-sm text-muted">
        The dashboard page you are looking for does not exist or was moved.
      </p>
      <Link
        href="/admin"
        className="mt-1 inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
      >
        Back to dashboard
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </div>
  );
}
