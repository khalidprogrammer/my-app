"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShowcaseSlide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  linkLabel: string;
};

/**
 * ShowcaseCarousel — "cinema" panel cycling through photo slides:
 * full-bleed image, gradient scrim, caption, frame label, counter
 * and prev/next arrows. Auto-advances every 6s, pauses on
 * hover/focus, honors reduced motion.
 *
 * Photography: royalty-free Pixabay images (no attribution required),
 * hosted locally under public/images/.
 */
function ShowcaseCarousel({ items }: { items: ShowcaseSlide[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const total = items.length;

  const go = React.useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total),
    [total],
  );

  React.useEffect(() => {
    if (paused || total <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, total, go]);

  if (total === 0) return null;
  const current = items[index] ?? items[0]!;

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl" aria-live="polite">
        <div className="relative aspect-[4/3] w-full">
          {items.map((slide, i) => (
            <div
              key={slide.src}
              aria-hidden={i === index ? undefined : true}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "z-10 opacity-100" : "z-0 opacity-0",
              )}
            >
              <Image
                src={slide.src}
                alt={i === index ? slide.alt : ""}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
          <div aria-hidden className="absolute inset-0 z-20 bg-gradient-to-t from-primary-ink/85 via-primary-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-30 p-5 pt-10 text-left">
            <p className="text-[11px] font-bold tracking-[0.14em] text-secondary uppercase">{current.eyebrow}</p>
            <p className="font-display mt-1 text-xl font-extrabold text-white">{current.title}</p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/70">{current.text}</p>
            <Link
              href={current.href}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-4 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              {current.linkLabel}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </div>
        <div className="absolute inset-x-5 top-4 z-30 flex items-center justify-between text-[11px] font-bold tracking-[0.14em] text-white/80 uppercase">
          <span className="rounded-full bg-primary-ink/50 px-2.5 py-1 backdrop-blur-sm">Global sourcing</span>
          <span className="rounded-full bg-primary-ink/50 px-2.5 py-1 backdrop-blur-sm">
            Field notes / {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="flex items-baseline gap-2 text-sm font-bold text-white" aria-live="polite">
          <span className="font-display text-lg">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-6 bg-white/25" />
          <span className="text-white/50">{String(total).padStart(2, "0")}</span>
          <span className="sr-only">of {total} highlights</span>
        </p>
        <div className="flex gap-2">
          {(
            [
              { dir: -1 as const, label: "Show previous highlight", Icon: ArrowLeft },
              { dir: 1 as const, label: "Show next highlight", Icon: ArrowRight },
            ]
          ).map(({ dir, label, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => go(dir)}
              aria-label={label}
              className={cn(
                "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border transition-colors",
                dir === 1
                  ? "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary-dark"
                  : "border-white/25 text-white hover:bg-white/10",
              )}
            >
              <Icon aria-hidden className="size-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ShowcaseCarousel };
export type { ShowcaseSlide as ShowcaseItem };
