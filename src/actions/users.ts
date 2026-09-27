"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/password";
import { userFormSchema } from "@/lib/validations/admin";
import { firstIssue, formStr, requirePerm, type ActionResult } from "./_helpers";

export async function saveUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("users.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id") || undefined;

  const roles = formData.getAll("roles").filter((r): r is string => typeof r === "string" && r.length > 0);
  const parsed = userFormSchema.safeParse({
    name: formStr(formData, "name"),
    email: formStr(formData, "email"),
    password: formStr(formData, "password"),
    status: formStr(formData, "status") || "ACTIVE",
    roles,
  });
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
  const d = parsed.data;
  const email = d.email.toLowerCase();

  const existingRoles = await db.role.findMany({ where: { name: { in: d.roles } }, select: { id: true, name: true } });
  if (existingRoles.length !== d.roles.length) return { ok: false, message: "One or more selected roles do not exist." };

  // Self-protection: never lock yourself out.
  const isSelf = id != null && id === ctx.user.id;
  if (isSelf) {
    if (d.status !== "ACTIVE") return { ok: false, message: "You cannot deactivate your own account." };
    const ownRoles = await db.userRole.findMany({
      where: { userId: ctx.user.id },
      include: { role: { select: { name: true } } },
    });
    const keepsSuperAdmin = d.roles.includes("SUPER_ADMIN") || !ownRoles.some((r) => r.role.name === "SUPER_ADMIN");
    if (!keepsSuperAdmin) return { ok: false, message: "You cannot remove your own SUPER_ADMIN role." };
  }

  if (id) {
    const old = await db.user.findUnique({ where: { id }, select: { email: true, name: true } });
    if (!old) return { ok: false, message: "User not found." };
    if (email !== old.email) {
      const clash = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (clash) return { ok: false, message: "Another user already uses this email." };
    }
    if (d.password && d.password.length < 8) return { ok: false, message: "New password must be at least 8 characters." };
    await db.$transaction([
      db.user.update({
        where: { id },
        data: {
          name: d.name,
          email,
          status: d.status,
          ...(d.password ? { passwordHash: await hashPassword(d.password) } : {}),
        },
      }),
      db.userRole.deleteMany({ where: { userId: id } }),
      db.userRole.createMany({ data: existingRoles.map((r) => ({ userId: id as string, roleId: r.id })) }),
    ]);
    await logAudit("user.update", "user", id, { email: old.email }, { email, roles: d.roles });
  } else {
    if (!d.password || d.password.length < 8) return { ok: false, message: "Set an initial password of at least 8 characters." };
    const clash = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (clash) return { ok: false, message: "Another user already uses this email." };
    const created = await db.user.create({
      data: {
        name: d.name,
        email,
        passwordHash: await hashPassword(d.password),
        status: d.status,
        userRoles: { create: existingRoles.map((r) => ({ roleId: r.id })) },
      },
      select: { id: true },
    });
    await logAudit("user.create", "user", created.id, null, { email, roles: d.roles });
  }
  return { ok: true, message: "User saved." };
}

export async function deleteUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await requirePerm("users.manage");
  if (!ctx) return { ok: false, message: error };
  const id = formStr(formData, "id");
  if (!id) return { ok: false, message: "Missing user." };
  if (id === ctx.user.id) return { ok: false, message: "You cannot delete your own account." };

  const target = await db.user.findUnique({
    where: { id },
    select: { email: true, userRoles: { include: { role: { select: { name: true } } } } },
  });
  if (!target) return { ok: false, message: "User not found." };
  if (target.userRoles.some((r) => r.role.name === "SUPER_ADMIN")) {
    const superCount = await db.userRole.count({
      where: { role: { name: "SUPER_ADMIN" }, user: { status: "ACTIVE" } },
    });
    if (superCount <= 1) return { ok: false, message: "Cannot delete the last active super-admin." };
  }

  await db.$transaction([
    db.session.deleteMany({ where: { userId: id } }),
    db.userRole.deleteMany({ where: { userId: id } }),
    db.user.delete({ where: { id } }),
  ]);
  await logAudit("user.delete", "user", id, { email: target.email });
  return { ok: true, message: "User deleted." };
}
