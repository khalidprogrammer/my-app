"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { mediaUsage } from "@/lib/media-usage";
import { deleteUploadFile } from "@/lib/upload";
import { formStr, requirePerm, type ActionResult } from "./_helpers";

export async function updateMediaAlt(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("media.create");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  const altText = formStr(formData, "altText").slice(0, 255) || null;
  if (!id) return { ok: false, message: "Missing media." };

  const old = await db.media.findUnique({ where: { id }, select: { fileName: true } });
  if (!old) return { ok: false, message: "Media not found." };
  await db.media.update({ where: { id }, data: { altText } });
  await logAudit("media.update", "media", id, { fileName: old.fileName }, { altText });
  return { ok: true, message: "Alt text saved." };
}

export async function deleteMedia(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("media.delete");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing media." };

  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { ok: false, message: "Media not found." };
  const usage = await mediaUsage(id);
  if (usage.length > 0) {
    return { ok: false, message: `Cannot delete: used by ${usage.slice(0, 3).join("; ")}${usage.length > 3 ? ` and ${usage.length - 3} more` : ""}.` };
  }

  await db.media.delete({ where: { id } });
  await deleteUploadFile(media.storageKey);
  await logAudit("media.delete", "media", id, { fileName: media.fileName, storageKey: media.storageKey });
  return { ok: true, message: "Media deleted." };
}
