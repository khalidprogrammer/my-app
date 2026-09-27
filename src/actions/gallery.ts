"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { assertSlugShape, resolveSlug } from "@/lib/validations/common";
import { galleryAlbumFormSchema } from "@/lib/validations/gallery";
import { parseImages } from "@/lib/validations/product";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function saveGalleryAlbum(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("gallery.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const parsed = galleryAlbumFormSchema.safeParse({
    name: formStr(formData, "name"),
    slug: formStr(formData, "slug"),
    description: formStr(formData, "description"),
    sortOrder: formStr(formData, "sortOrder") || "0",
    status: formStr(formData, "status") || "ACTIVE",
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const slug = resolveSlug(parsed.data.name, parsed.data.slug);
  if (!assertSlugShape(slug)) return { ok: false, message: "Slug may only contain lowercase letters, numbers and hyphens." };
  const clash = await db.galleryAlbum.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== id) return { ok: false, message: "Another album already uses this slug." };

  const data = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    sortOrder: parsed.data.sortOrder,
    status: parsed.data.status,
  };

  if (id) {
    const old = await db.galleryAlbum.findUnique({ where: { id }, select: { name: true } });
    if (!old) return { ok: false, message: "Album not found." };
    await db.galleryAlbum.update({ where: { id }, data });
    await logAudit("gallery_album.update", "gallery_album", id, { name: old.name }, { name: data.name, slug });
  } else {
    const created = await db.galleryAlbum.create({ data, select: { id: true } });
    await logAudit("gallery_album.create", "gallery_album", created.id, null, { name: data.name, slug });
  }

  revalidateGallery();
  return { ok: true, message: "Album saved." };
}

export async function deleteGalleryAlbum(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("gallery.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing album." };

  const [itemCount, old] = await Promise.all([
    db.galleryItem.count({ where: { albumId: id } }),
    db.galleryAlbum.findUnique({ where: { id }, select: { name: true, slug: true } }),
  ]);
  if (!old) return { ok: false, message: "Album not found." };
  if (itemCount > 0) {
    return { ok: false, message: `Cannot delete: ${itemCount} photo${itemCount === 1 ? " is" : "s are"} still in this album. Remove them first.` };
  }
  await db.galleryAlbum.delete({ where: { id } });
  await logAudit("gallery_album.delete", "gallery_album", id, { name: old.name });
  revalidateGallery();
  return { ok: true, message: "Album deleted." };
}

export async function addGalleryItems(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("gallery.manage");
  if (!ctx) return { ok: false, message: error };
  const albumId = formStr(formData, "albumId");
  if (!albumId) return { ok: false, message: "Missing album." };

  const album = await db.galleryAlbum.findUnique({ where: { id: albumId }, select: { id: true, slug: true } });
  if (!album) return { ok: false, message: "Album not found." };

  // Reuses the MediaPicker payload shape ({ mediaId, isPrimary }[]).
  let picked: { mediaId: string }[];
  try {
    picked = parseImages(formStr(formData, "imagesJson") || "[]");
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Selected photos are invalid." };
  }
  const mediaIds = [...new Set(picked.map((p) => p.mediaId))];
  if (mediaIds.length === 0) return { ok: false, message: "Select at least one image." };
  if (mediaIds.length > 50) return { ok: false, message: "Add at most 50 photos at once." };

  const [existing, mediaCount] = await Promise.all([
    db.galleryItem.findMany({ where: { albumId }, select: { mediaId: true } }),
    db.media.count({ where: { id: { in: mediaIds } } }),
  ]);
  if (mediaCount !== mediaIds.length) return { ok: false, message: "One or more selected images no longer exist." };
  const alreadyIn = new Set(existing.map((e) => e.mediaId));
  const fresh = mediaIds.filter((id) => !alreadyIn.has(id));
  if (fresh.length === 0) return { ok: false, message: "These photos are already in this album." };

  const maxSort = await db.galleryItem.aggregate({ where: { albumId }, _max: { sortOrder: true } });
  const base = (maxSort._max.sortOrder ?? -1) + 1;
  await db.galleryItem.createMany({
    data: fresh.map((mediaId, i) => ({ albumId, mediaId, sortOrder: base + i })),
  });
  await logAudit("gallery_item.add", "gallery_album", albumId, null, { added: fresh.length });
  revalidateGallery();
  return { ok: true, message: `Added ${fresh.length} photo${fresh.length === 1 ? "" : "s"}.` };
}

export async function updateGalleryItem(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("gallery.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing item." };

  const captionRaw = formStr(formData, "caption").trim();
  if (captionRaw.length > 500) return { ok: false, message: "Caption is too long (max 500 characters)." };
  const caption = captionRaw === "" ? null : captionRaw;

  const item = await db.galleryItem.findUnique({ where: { id }, select: { id: true } });
  if (!item) return { ok: false, message: "Photo not found." };
  await db.galleryItem.update({ where: { id }, data: { caption } });
  await logAudit("gallery_item.update", "gallery_item", id, null, { caption });
  revalidateGallery();
  return { ok: true, message: "Caption saved." };
}

export async function moveGalleryItem(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("gallery.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  const direction = formStr(formData, "direction");
  if (!id || (direction !== "up" && direction !== "down")) return { ok: false, message: "Invalid move." };

  const item = await db.galleryItem.findUnique({
    where: { id },
    select: { albumId: true, sortOrder: true },
  });
  if (!item) return { ok: false, message: "Photo not found." };

  const neighbor = await db.galleryItem.findFirst({
    where: {
      albumId: item.albumId,
      sortOrder: direction === "up" ? { lt: item.sortOrder } : { gt: item.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    select: { id: true, sortOrder: true },
  });
  if (!neighbor) return { ok: false, message: "Already at the edge." };

  await db.$transaction([
    db.galleryItem.update({ where: { id }, data: { sortOrder: neighbor.sortOrder } }),
    db.galleryItem.update({ where: { id: neighbor.id }, data: { sortOrder: item.sortOrder } }),
  ]);
  revalidateGallery();
  return { ok: true, message: "Photo moved." };
  return { ok: true, message: "Photo moved." };
}

export async function removeGalleryItem(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("gallery.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing item." };

  const item = await db.galleryItem.findUnique({ where: { id }, select: { id: true } });
  if (!item) return { ok: false, message: "Photo not found." };
  await db.galleryItem.delete({ where: { id } });
  await logAudit("gallery_item.remove", "gallery_item", id);
  revalidateGallery();
  return { ok: true, message: "Photo removed from the album." };
}
