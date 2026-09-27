"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Pencil, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Field, Input } from "@/components/ui/form";
import { DeleteButton } from "@/components/admin/delete-button";
import { updateMediaAlt, deleteMedia } from "@/actions/media";

/** MediaUpload — posts to /api/uploads, then refreshes the grid. */
function MediaUpload() {
  const [pending, startTransition] = React.useTransition();
  const [fileName, setFileName] = React.useState("");
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast({ title: "Choose a file first.", variant: "warning" });
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      try {
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          toast({ title: "Upload failed", description: body.error ?? "Try again.", variant: "danger" });
          return;
        }
        toast({ title: "Image uploaded.", variant: "success" });
        setFileName("");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } catch {
        toast({ title: "Upload failed", description: "Network error. Try again.", variant: "danger" });
      }
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Field label="Upload image" htmlFor="media-file" hint="JPG, PNG, WebP, GIF or AVIF — max 5 MB.">
          <Input
            id="media-file"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:pointer-events-none disabled:opacity-50"
      >
        <Upload aria-hidden className="size-4" />
        {pending ? "Uploading…" : fileName ? `Upload ${fileName.slice(0, 24)}` : "Upload"}
      </button>
    </form>
  );
}

/** MediaItem — thumbnail card with alt-text editing and guarded delete. */
function MediaItem({
  media,
  canEdit,
  canDelete,
}: {
  media: { id: string; url: string; fileName: string; altText: string | null; fileSize: bigint; createdAt: Date };
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [alt, setAlt] = React.useState(media.altText ?? "");
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const saveAlt = () => {
    const fd = new FormData();
    fd.set("id", media.id);
    fd.set("altText", alt);
    startTransition(async () => {
      const result = await updateMediaAlt({ ok: false, message: "" }, fd);
      if (result.ok) {
        toast({ title: result.message, variant: "success" });
        setEditing(false);
        router.refresh();
      } else {
        toast({ title: "Could not save", description: result.message, variant: "danger" });
      }
    });
  };

  const kb = Math.max(1, Math.round(Number(media.fileSize) / 1024));

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.url} alt={media.altText ?? media.fileName} loading="lazy" className="aspect-square w-full object-cover" />
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-[13px] font-semibold" title={media.fileName}>{media.fileName}</p>
        <p className="text-xs text-muted">{kb} KB · {media.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        {editing ? (
          <span className="mt-1 flex gap-1.5">
            <Input
              value={alt}
              maxLength={255}
              placeholder="Alt text…"
              aria-label={`Alt text for ${media.fileName}`}
              onChange={(e) => setAlt(e.target.value)}
              className="h-8 text-[13px]"
            />
            <button
              type="button"
              onClick={saveAlt}
              disabled={pending}
              aria-label="Save alt text"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              <Check aria-hidden className="size-4" />
            </button>
          </span>
        ) : (
          <span className="flex items-center justify-between gap-1">
            <span className="truncate text-xs text-muted">{media.altText || "No alt text"}</span>
            <span className="flex shrink-0 items-center">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={`Edit alt text for ${media.fileName}`}
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-primary transition-colors hover:bg-primary-tint"
                >
                  <Pencil aria-hidden className="size-3.5" />
                </button>
              )}
              {canDelete && (
                <DeleteButton
                  action={deleteMedia}
                  id={media.id}
                  title="Delete media?"
                  description={`“${media.fileName}” will be permanently removed. Files used by content cannot be deleted.`}
                />
              )}
            </span>
          </span>
        )}
      </div>
    </li>
  );
}

export { MediaUpload, MediaItem };
