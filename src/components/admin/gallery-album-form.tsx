"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { SlugField } from "@/components/admin/slug-field";
import { AdminSubmit, FormMessage, CancelLink } from "@/components/admin/form-state";
import { saveGalleryAlbum } from "@/actions/gallery";

export type GalleryAlbumInitial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  status: "ACTIVE" | "INACTIVE";
};

/** GalleryAlbumForm — shared create/edit side-form. */
function GalleryAlbumForm({ initial }: { initial?: GalleryAlbumInitial }) {
  const [state, dispatch] = useActionState(saveGalleryAlbum, { ok: false, message: "" });
  const { toast } = useToast();
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const done = React.useRef(false);

  React.useEffect(() => {
    if (state.ok && !done.current) {
      done.current = true;
      toast({ title: state.message, variant: "success" });
      if (!initial) formRef.current?.reset();
      router.refresh();
      if (initial) router.push("/admin/gallery");
    }
  }, [state, toast, router, initial]);

  React.useEffect(() => {
    done.current = false;
  }, [initial?.id]);

  return (
    <form ref={formRef} action={dispatch} className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">{initial ? "Edit album" : "New album"}</h2>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage state={state} />
      <Field label="Name" htmlFor="album-name" required>
        <Input id="album-name" name="name" required maxLength={191} defaultValue={initial?.name} placeholder="e.g. Operations" />
      </Field>
      <SlugField nameInputId="album-name" defaultValue={initial?.slug} />
      <Field label="Description" htmlFor="album-description">
        <Textarea id="album-description" name="description" rows={3} defaultValue={initial?.description ?? ""} placeholder="What this album shows." />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Sort order" htmlFor="album-sort">
          <Input id="album-sort" name="sortOrder" inputMode="numeric" defaultValue={initial?.sortOrder ?? 0} />
        </Field>
        <Field label="Status" htmlFor="album-status">
          <Select id="album-status" name="status" defaultValue={initial?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
      </div>
      <div className="flex gap-2">
        {initial && <CancelLink href="/admin/gallery" />}
        <AdminSubmit label={initial ? "Save changes" : "Create album"} className="flex-1" />
      </div>
    </form>
  );
}

export { GalleryAlbumForm };
