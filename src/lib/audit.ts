import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminContext, requestMeta } from "@/lib/admin-auth";

/**
 * Audit logging for important admin operations (database_schema.md §23).
 * Best-effort: never throws, so logging can never break a mutation.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string | null,
  oldValues?: unknown,
  newValues?: unknown,
): Promise<void> {
  try {
    const [ctx, meta] = await Promise.all([getAdminContext(), requestMeta()]);
    await db.auditLog.create({
      data: {
        userId: ctx?.user.id ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        oldValues: (oldValues ?? undefined) as Prisma.InputJsonValue | undefined,
        newValues: (newValues ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      },
    });
  } catch {
    // Audit must never break the request.
  }
}
