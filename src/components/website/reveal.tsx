"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal — scroll-triggered entrance (IntersectionObserver, staggered via
 * `delay`). Starts hidden; reduced-motion users (see globals.css) get the
 * final state instantly with no animation.
 */
function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 100 | 200 | 300 | 400 | 500;
  direction?: "up" | "scale";
}) {
  const [visible, setVisible] = React.useState(false);

  // IntersectionObserver attached via callback ref (with React 19 cleanup),
  // keeping setState out of effects entirely.
  const observe = React.useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={observe}
      style={visible && delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "translate-y-0 scale-100 opacity-100" : "opacity-0",
        !visible && direction === "up" && "translate-y-6",
        !visible && direction === "scale" && "scale-[0.97]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Reveal };
