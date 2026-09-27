import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: keep this file dependency-free. Importing lib/admin-auth here would
// pull Prisma (and node:crypto) into the proxy bundle — instead we only
// check cookie *presence*; the dashboard layout verifies the session.
const SESSION_COOKIE = "admin_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) return NextResponse.next();

  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
