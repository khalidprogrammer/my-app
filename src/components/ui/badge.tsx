import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-tint text-primary",
        secondary: "border-transparent bg-secondary-tint text-secondary-dark",
        outline: "border-border bg-surface text-muted",
        success: "border-transparent bg-success-tint text-success",
        warning: "border-transparent bg-warning-tint text-warning",
        danger: "border-transparent bg-danger-tint text-danger",
        solid: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export type StatusTone = "default" | "secondary" | "success" | "warning" | "danger" | "outline";

/**
 * Domain status → badge tone mapping.
 * Covers product/news (draft/published/archived), quotes (8 statuses),
 * contacts (new/read/replied/archived) and generic active/inactive.
 */
const STATUS_TONES: Record<string, StatusTone> = {
  published: "success",
  active: "success",
  confirmed: "success",
  completed: "success",
  replied: "success",
  new: "default",
  contacted: "secondary",
  quotation_sent: "secondary",
  negotiation: "warning",
  read: "secondary",
  draft: "outline",
  archived: "outline",
  rejected: "danger",
  inactive: "outline",
};

function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const key = status.toLowerCase().replace(/[\s-]+/g, "_");
  const tone = STATUS_TONES[key] ?? "default";
  const text = label ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <Badge variant={tone} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {text}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
