"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createAdminSession, destroyAdminSession, requestMeta } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";
import type { ActionResult } from "./_helpers";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

/** Sign in with email + password. Redirects to /admin on success. */
export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const meta = await requestMeta();
  const key = `admin-login:${meta.ip ?? "unknown"}`;
  if (!checkRateLimit(key, 10, 10 * 60 * 1000)) {
    return { ok: false, message: "Too many sign-in attempts. Try again in a few minutes." };
  }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  // Generic failure message — never reveal whether the email exists.
  const invalid = { ok: false, message: "Invalid email or password." } as ActionResult;
  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { userRoles: { select: { roleId: true } } },
  });
  if (!user || user.status !== "ACTIVE" || user.userRoles.length === 0) return invalid;
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return invalid;

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createAdminSession(user.id);
  await logAudit("auth.login", "user", user.id);
  const next = String(formData.get("next") ?? "/admin");
  // Strict same-origin allowlist: exactly /admin or a path beneath it.
  redirect(next === "/admin" || next.startsWith("/admin/") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
