"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Field, Input } from "@/components/ui/form";
import { AdminSubmit, FormMessage } from "@/components/admin/form-state";
import { DeleteButton } from "@/components/admin/delete-button";
import { MediaPicker, type MediaOption } from "@/components/admin/media-picker";
import { addGalleryItems, updateGalleryItem, moveGalleryItem, removeGalleryItem } from "@/actions/gallery";

/** AddPhotosForm — pick media-library images into the album. */
function AddPhotosForm({ albumId, media }: { albumId: string; media: MediaOption[] }) {
  const [state, dispatch] = useActionState(addGalleryItems, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.message && !done.current) {
      done.current = true;
      toast({ title: state.ok ? state.message : "Could not add photos", description: state.ok ? undefined : state.message, variant: state.ok ? "success" : "danger" });
      if (state.ok) router.refresh();
      done.current = false;
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <input type="hidden" name="albumId" value={albumId} />
      <h3 className="text-base font-semibold">Add photos</h3>
      <FormMessage state={state} />
      <MediaPicker media={media} />
      <div>
        <AdminSubmit label="Add to album" />
      </div>
    </form>
  );
}

export type GalleryPhotoRow = {
  id: string;
  caption: string | null;
  sortOrder: number;
  media: { id: string; url: string; fileName: string; altText: string | null };
};

/** PhotoRow — thumbnail, caption editor, reorder, remove. */
function PhotoRow({ item, isFirst, isLast }: { item: GalleryPhotoRow; isFirst: boolean; isLast: boolean }) {
  const [state, dispatch] = useActionState(updateGalleryItem, { ok: false, message: "" });
  const [moving, startMove] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.message && !done.current) {
      done.current = true;
      toast({ title: state.ok ? state.message : "Could not save", description: state.ok ? undefined : state.message, variant: state.ok ? "success" : "danger" });
      if (state.ok) router.refresh();
      done.current = false;
    }
  }, [state, toast, router]);

  const move = (direction: "up" | "down") => {
    const fd = new FormData();
    fd.set("id", item.id);
    fd.set("direction", direction);
    startMove(async () => {
      const result = await moveGalleryItem({ ok: false, message: "" }, fd);
      if (result.ok) router.refresh();
      else toast({ title: "Could not move", description: result.message, variant: "danger" });
    });
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.media.url}
        alt={item.media.altText ?? item.media.fileName}
        loading="lazy"
        className="aspect-square w-full shrink-0 rounded-md border border-border object-cover sm:w-20"
      />
      <form action={dispatch} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="id" value={item.id} />
        <div className="min-w-0 flex-1">
          <Field label={`Caption — ${item.media.fileName}`} htmlFor={`caption-${item.id}`}>
            <Input
              id={`caption-${item.id}`}
              name="caption"
              maxLength={500}
              defaultValue={item.caption ?? ""}
              placeholder="Optional caption shown under the photo"
            />
          </Field>
        </div>
        <button
          type="submit"
          aria-label={`Save caption for ${item.media.fileName}`}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          <Check aria-hidden className="size-4" />
          <span className="sm:hidden">Save caption</span>
        </button>
      </form>
      {state.message && !state.ok && (
        <p role="alert" className="text-[13px] font-medium text-danger">{state.message}</p>
      )}
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => move("up")}
          disabled={isFirst || moving}
          aria-label="Move photo earlier"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => move("down")}
          disabled={isLast || moving}
          aria-label="Move photo later"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDown aria-hidden className="size-4" />
        </button>
        <DeleteButton
          action={removeGalleryItem}
          id={item.id}
          title="Remove photo?"
          description={`“${item.media.fileName}” will be removed from this album (the file stays in the media library).`}
          label="Remove"
        />
      </span>
    </li>
  );
}

export { AddPhotosForm, PhotoRow };
