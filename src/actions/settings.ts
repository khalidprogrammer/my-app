"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { formStr, requirePerm, type ActionResult } from "./_helpers";

/**
 * Website settings editor. Only keys already present in site_settings can be
 * updated (prevents arbitrary key creation); values are coerced by `type`.
 */
export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("settings.manage");
  if (!ctx) return { ok: false, message: error };

  const settings = await db.siteSetting.findMany({ select: { id: true, key: true, type: true } });
  const changed: string[] = [];

  for (const s of settings) {
    const raw = formData.get(`setting:${s.key}`);
    if (typeof raw !== "string") continue;
    const value = raw.trim();
    const normalized: string | null = value === "" ? null : value;
    if (normalized != null) {
      if (s.type === "NUMBER" && !Number.isFinite(Number(normalized))) {
        return { ok: false, message: `Setting “${s.key}” must be a number.` };
      }
      if (s.type === "BOOLEAN" && !["true", "false", "1", "0"].includes(normalized.toLowerCase())) {
        return { ok: false, message: `Setting “${s.key}” must be true or false.` };
      }
      if (s.type === "JSON") {
        try {
          JSON.parse(normalized);
        } catch {
          return { ok: false, message: `Setting “${s.key}” must be valid JSON.` };
        }
      }
    }
    await db.siteSetting.update({ where: { id: s.id }, data: { value: normalized, updatedBy: ctx.user.id } });
    changed.push(s.key);
  }

  if (changed.length > 0) await logAudit("settings.update", "site_setting", null, null, { keys: changed });
  // Settings feed the header, footer and contact page (all statically
  // rendered), so refresh the whole site layout when anything changes.
  revalidatePath("/", "layout");
  return { ok: true, message: changed.length > 0 ? `Saved ${changed.length} setting${changed.length === 1 ? "" : "s"}.` : "Nothing to save." };
}

export async function saveHomepageSection(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("homepage.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing section." };

  const section = await db.homepageSection.findUnique({ where: { id }, select: { sectionKey: true } });
  if (!section) return { ok: false, message: "Section not found." };

  const status = formStr(formData, "status");
  if (status !== "ACTIVE" && status !== "INACTIVE") return { ok: false, message: "Invalid status." };

  const data = {
    title: formStr(formData, "title").slice(0, 255) || null,
    subtitle: formStr(formData, "subtitle") || null,
    content: formStr(formData, "content") || null,
    status: status as "ACTIVE" | "INACTIVE",
  };
  await db.homepageSection.update({ where: { id }, data });
  await logAudit("homepage.update", "homepage_section", id, { sectionKey: section.sectionKey }, { status: data.status });
  revalidatePath("/", "layout");
  return { ok: true, message: "Section saved." };
}
