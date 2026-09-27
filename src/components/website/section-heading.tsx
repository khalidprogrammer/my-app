import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** SectionHeading — eyebrow + title + optional description + link. */
function SectionHeading({
  eyebrow,
  title,
  description,
  linkLabel,
  linkHref,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  linkLabel?: string;
  linkHref?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow-pill">{eyebrow}</p>}
      <h2 className={cn(align === "center" && "max-w-2xl")}>{title}</h2>
      {description && (
        <p className={cn("text-lead max-w-2xl", align === "center" && "mx-auto")}>{description}</p>
      )}
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      )}
    </div>
  );
}

export { SectionHeading };
