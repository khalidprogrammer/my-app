import * as React from "react";
import { cn } from "@/lib/utils";

/** Container — responsive page gutter (see `.container-site` in globals.css). */
function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-site", className)} {...props} />;
}

/** NarrowContainer — readable measure for prose/forms. */
function NarrowContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container-narrow", className)} {...props} />;
}

export { Container, NarrowContainer };
