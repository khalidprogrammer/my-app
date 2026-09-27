"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

const contactUpdateSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]),
  assignedTo: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export async function updateContact(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("contacts.update");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing message." };

  const parsed = contactUpdateSchema.safeParse({
    status: formStr(formData, "status"),
    assignedTo: formStr(formData, "assignedTo"),
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const old = await db.contactMessage.findUnique({ where: { id }, select: { status: true, email: true } });
  if (!old) return { ok: false, message: "Message not found." };
  if (parsed.data.assignedTo) {
    const assignee = await db.user.findFirst({
      where: { id: parsed.data.assignedTo, status: "ACTIVE" },
      select: { id: true },
    });
    if (!assignee) return { ok: false, message: "Assignee is not an active user." };
  }

  await db.contactMessage.update({
    where: { id },
    data: { status: parsed.data.status, assignedTo: parsed.data.assignedTo ?? null },
  });
  await logAudit("contact.update", "contact_message", id, { status: old.status }, { status: parsed.data.status });
  revalidatePath("/admin/quotes");
  return { ok: true, message: "Message updated." };
}

export async function deleteContact(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("contacts.delete");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing message." };

  const old = await db.contactMessage.findUnique({ where: { id }, select: { email: true } });
  if (!old) return { ok: false, message: "Message not found." };
  await db.contactMessage.delete({ where: { id } });
  await logAudit("contact.delete", "contact_message", id, { email: old.email });
  revalidatePath("/admin/quotes");
  return { ok: true, message: "Message deleted." };
}
