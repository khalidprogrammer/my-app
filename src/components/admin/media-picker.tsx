"use client";

import * as React from "react";
import { ImagePlus, Star, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export type MediaOption = { id: string; url: string; fileName: string; altText: string | null };
export type ImageSelection = { mediaId: string; isPrimary: boolean };

/**
 * MediaPicker — attach media-library images to a product.
 * Serialized into a hidden `imagesJson` input for the server action.
 * Uploads happen in the Media library; the picker only selects.
 */
function MediaPicker({ media, initial = [] }: { media: MediaOption[]; initial?: ImageSelection[] }) {
  const [selected, setSelected] = React.useState<ImageSelection[]>(initial);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>([]);

  const byId = React.useMemo(() => new Map(media.map((m) => [m.id, m])), [media]);

  const openPicker = () => {
    setDraft(selected.map((s) => s.mediaId));
    setPickerOpen(true);
  };

  const applyDraft = () => {
    setSelected((prev) => {
      const prevPrimary = prev.find((s) => s.isPrimary)?.mediaId;
      return draft.map((mediaId) => ({
        mediaId,
        isPrimary: prevPrimary ? mediaId === prevPrimary : mediaId === draft[0],
      }));
    });
    setPickerOpen(false);
  };

  const setPrimary = (mediaId: string) =>
    setSelected((prev) => prev.map((s) => ({ ...s, isPrimary: s.mediaId === mediaId })));

  const remove = (mediaId: string) =>
    setSelected((prev) => {
      const rest = prev.filter((s) => s.mediaId !== mediaId);
      if (rest.length > 0 && !rest.some((s) => s.isPrimary)) rest[0]!.isPrimary = true;
      return rest;
    });

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="imagesJson" value={JSON.stringify(selected)} readOnly />

      {selected.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted">
          No images attached. Upload files in the Media library first, then pick them here.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {selected.map((s) => {
            const m = byId.get(s.mediaId);
            if (!m) return null;
            return (
              <li key={s.mediaId} className="relative overflow-hidden rounded-md border border-border bg-faint">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.altText ?? m.fileName} className="aspect-square w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-primary-ink/70 p-1.5">
                  <button
                    type="button"
                    onClick={() => setPrimary(s.mediaId)}
                    title={s.isPrimary ? "Primary image" : "Set as primary"}
                    aria-pressed={s.isPrimary}
                    className={cn(
                      "inline-flex h-7 cursor-pointer items-center gap-1 rounded px-2 text-[11px] font-bold",
                      s.isPrimary ? "bg-secondary text-secondary-foreground" : "bg-white/15 text-white hover:bg-white/25",
                    )}
                  >
                    <Star aria-hidden className="size-3" />
                    {s.isPrimary ? "Primary" : "Make primary"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s.mediaId)}
                    aria-label={`Remove ${m.fileName}`}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded bg-white/15 text-white hover:bg-danger"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3.5 text-[13px] font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <ImagePlus aria-hidden className="size-4" />
          {selected.length > 0 ? "Change images" : "Choose images"}
        </button>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent onClose={() => setPickerOpen(false)} className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose images</DialogTitle>
            <DialogDescription>Select from the media library. The first selected becomes the primary image.</DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4">
            {media.length === 0 && (
              <p className="col-span-full rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                The media library is empty. Upload images under Media first.
              </p>
            )}
            {media.map((m) => {
              const active = draft.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDraft((prev) => (prev.includes(m.id) ? prev.filter((id) => id !== m.id) : [...prev, m.id]))}
                  aria-pressed={active}
                  title={m.fileName}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-md border-2 transition-colors",
                    active ? "border-primary" : "border-transparent hover:border-muted",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.altText ?? m.fileName} loading="lazy" className="aspect-square w-full object-cover" />
                  {active && (
                    <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check aria-hidden className="size-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border px-5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyDraft}
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Apply ({draft.length})
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { MediaPicker };
