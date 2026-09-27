import { cache } from "react";
import { cookies, headers } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";

/**
 * Admin session management (Architecture.md §6).
 * Opaque token in an httpOnly cookie; only its SHA-256 hash is stored.
 * Full verification (DB lookup + expiry + ACTIVE status + roles/permissions)
 * happens on every call — middleware only checks cookie presence.
 */
export const SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 7;

export type AdminUser = { id: string; name: string; email: string };
export type AdminContext = { user: AdminUser; roles: string[]; permissions: string[] };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: { include: { rolePermissions: { include: { permission: true } } } },
            },
          },
        },
      },
    },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  if (session.user.status !== "ACTIVE") return null;

  const roles = session.user.userRoles.map((ur) => ur.role.name);
  const permissions = [
    ...new Set(
      session.user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name)),
    ),
  ];
  return { user: { id: session.user.id, name: session.user.name, email: session.user.email }, roles, permissions };
});

export function hasPermission(ctx: AdminContext | null, permission: string): boolean {
  return ctx != null && (ctx.permissions.includes(permission) || ctx.roles.includes("SUPER_ADMIN"));
}

/** True when the context carries ANY of the listed permissions. */
export function can(ctx: AdminContext | null, ...permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(ctx, p));
}

export async function requestMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  };
}

export async function createAdminSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const meta = await requestMeta();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    },
  });
  // Prune stale sessions opportunistically.
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => undefined);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.delete({ where: { tokenHash: hashToken(token) } }).catch(() => undefined);
  }
  jar.delete(SESSION_COOKIE);
}
