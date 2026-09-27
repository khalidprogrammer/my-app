import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-auth";
import { pageMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = pageMetadata({
  title: "Admin Sign In",
  description: "Sign in to the website administration dashboard.",
  path: "/admin/login",
  noIndex: true,
});

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const ctx = await getAdminContext();
  if (ctx) redirect("/admin");
  const { next } = await searchParams;
  const safeNext = next && (next === "/admin" || next.startsWith("/admin/")) ? next : "/admin";

  return (
    <div className="admin-theme flex min-h-screen items-center justify-center bg-primary-ink px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-8 shadow-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-faint px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-secondary" />
          Staff access
        </p>
        <p className="mt-3 text-lg leading-snug font-extrabold tracking-tight text-ink">
          Guangxi YanHeng International Trade Co., Ltd.<span className="text-secondary-dark">.</span>
        </p>
        <h1 className="mt-2 text-2xl">Admin sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Restricted to authorized staff members.</p>
        <LoginForm next={safeNext} />
      </div>
    </div>
  );
}
