"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { deleteUploadFile } from "@/lib/upload";
import { quoteUpdateSchema } from "@/lib/validations/admin";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

const DB_STATUS: Record<string, string> = {
  NEW: "new",
  CONTACTED: "contacted",
  QUOTATION_SENT: "quotation_sent",
  NEGOTIATION: "negotiation",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  REJECTED: "rejected",
  ARCHIVED: "archived",
};

export async function updateQuote(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("quotes.update");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing quote." };

  const parsed = quoteUpdateSchema.safeParse({
    status: formStr(formData, "status"),
    assignedTo: formStr(formData, "assignedTo"),
    note: formStr(formData, "note"),
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const d = parsed.data;

  const quote = await db.quote.findUnique({ where: { id }, select: { status: true, referenceNo: true } });
  if (!quote) return { ok: false, message: "Quote not found." };

  if (d.assignedTo) {
    const assignee = await db.user.findFirst({
      where: { id: d.assignedTo, status: "ACTIVE" },
      select: { id: true },
    });
    if (!assignee) return { ok: false, message: "Assignee is not an active user." };
  }

  const statusChanged = quote.status !== d.status;
  await db.$transaction([
    db.quote.update({ where: { id }, data: { status: d.status, assignedTo: d.assignedTo ?? null } }),
    ...(statusChanged
      ? [
          db.quoteStatusHistory.create({
            data: {
              quoteId: id,
              oldStatus: DB_STATUS[quote.status] ?? quote.status.toLowerCase(),
              newStatus: DB_STATUS[d.status] ?? d.status.toLowerCase(),
              changedBy: ctx.user.id,
              note: d.note || null,
            },
          }),
        ]
      : []),
  ]);

  await logAudit("quote.update", "quote", id, { status: quote.status }, { status: d.status, assignedTo: d.assignedTo });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  return { ok: true, message: "Quote updated." };
}

export async function deleteQuote(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("quotes.delete");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing quote." };

  const old = await db.quote.findUnique({
    where: { id },
    select: { referenceNo: true, attachmentId: true, attachment: { select: { storageKey: true } } },
  });
  if (!old) return { ok: false, message: "Quote not found." };
  await db.$transaction([
    db.quoteStatusHistory.deleteMany({ where: { quoteId: id } }),
    db.quoteItem.deleteMany({ where: { quoteId: id } }),
    db.quote.delete({ where: { id } }),
    ...(old.attachmentId ? [db.media.delete({ where: { id: old.attachmentId } })] : []),
  ]);
  if (old.attachment) await deleteUploadFile(old.attachment.storageKey);
  await logAudit("quote.delete", "quote", id, { referenceNo: old.referenceNo });
  revalidatePath("/admin/quotes");
  return { ok: true, message: "Quote deleted." };
}
