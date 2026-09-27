"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "@/lib/queries";

/**
 * GalleryGrid — responsive photo grid with a full lightbox:
 * keyboard arrows/ESC, counter, captions, backdrop close, scroll lock.
 */
function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [index, setIndex] = React.useState<number | null>(null);
  const total = photos.length;

  const go = React.useCallback(
    (dir: 1 | -1) => setIndex((i) => (i == null ? i : (i + dir + total) % total)),
    [total],
  );

  React.useEffect(() => {
    if (index == null) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [index, go]);

  const current = index != null ? photos[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open photo: ${photo.caption ?? photo.alt}`}
            className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="relative block aspect-square w-full">
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
            </span>
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-primary-ink/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            <span className="absolute inset-x-0 bottom-0 flex translate-y-1 items-center justify-between gap-2 p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <span className="truncate text-left text-[13px] font-semibold text-white">
                {photo.caption ?? photo.albumName}
              </span>
              <Expand className="size-4 shrink-0 text-white" />
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer: ${current.caption ?? current.alt}`}
          className="fixed inset-0 z-[70] flex flex-col bg-primary-ink/95 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setIndex(null)}
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 py-2">
            <p className="text-sm font-bold text-white" aria-live="polite">
              <span className="font-display text-base">{index! + 1}</span>
              <span className="text-white/50"> / {total}</span>
            </p>
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Close viewer"
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <div
            className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full max-h-[70vh] w-full overflow-hidden rounded-2xl">
              <Image
                key={current.id}
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </div>
            {total > 1 && (
              <>
                {(
                  [
                    { dir: -1 as const, label: "Previous photo", Icon: ChevronLeft, side: "left-2 sm:left-4" },
                    { dir: 1 as const, label: "Next photo", Icon: ChevronRight, side: "right-2 sm:right-4" },
                  ]
                ).map(({ dir, label, Icon, side }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(dir)}
                    aria-label={label}
                    className={cn(
                      "absolute top-1/2 z-10 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-secondary hover:text-secondary-foreground",
                      side,
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-5xl py-3 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="truncate text-sm font-semibold text-white">
              {current.caption ?? current.albumName}
            </p>
            <p className="mt-0.5 text-xs text-white/55">{current.albumName}</p>
          </div>
        </div>
      )}
    </>
  );
}

export { GalleryGrid };
