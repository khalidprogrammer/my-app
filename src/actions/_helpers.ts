import type { z } from "zod";
import { getAdminContext, hasPermission, type AdminContext } from "@/lib/admin-auth";

export type ActionResult = { ok: boolean; message: string };

export async function requirePerm(
  permission: string,
): Promise<{ ctx: AdminContext; error: null } | { ctx: null; error: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return { ctx: null, error: "Your session expired. Please sign in again." };
  if (!hasPermission(ctx, permission)) return { ctx: null, error: "You do not have permission for this action." };
  return { ctx, error: null };
}

/** Any-of permissions guard. */
export async function requireAnyPerm(
  ...permissions: string[]
): Promise<{ ctx: AdminContext; error: null } | { ctx: null; error: string }> {
  const ctx = await getAdminContext();
  if (!ctx) return { ctx: null, error: "Your session expired. Please sign in again." };
  if (!permissions.some((p) => hasPermission(ctx, p))) {
    return { ctx: null, error: "You do not have permission for this action." };
  }
  return { ctx, error: null };
}

export function formStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function formBool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}
