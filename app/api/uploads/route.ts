import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminContext, hasPermission } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/ratelimit";
import { saveUploadFile } from "@/lib/upload";
import { logAudit } from "@/lib/audit";

/**
 * Reject cross-site requests. The session cookie is SameSite=Lax, which still
 * allows top-level navigational POSTs to carry it — an Origin check closes
 * that CSRF gap for this cookie-authenticated endpoint. (Server Actions get
 * equivalent protection from the framework; this route handler needs its own.)
 */
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients send no Origin; cookie auth still applies
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * POST /api/uploads — admin image upload (Architecture.md §7: file upload
 * endpoint). Multipart field "file". Validated type + 5 MB limit in
 * lib/upload; file lands under public/uploads/, metadata in `media`.
 */
export async function POST(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx || !hasPermission(ctx, "media.create")) {
    return NextResponse.json({ error: "Sign in with upload permission first." }, { status: 403 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  }
  if (!checkRateLimit(`upload:${ctx.user.id}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const value = form.get("file");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Choose a file first." }, { status: 400 });

  try {
    const saved = await saveUploadFile(file);
    const media = await db.media.create({
      data: { ...saved, uploadedBy: ctx.user.id },
      select: { id: true, url: true, fileName: true },
    });
    await logAudit("media.upload", "media", media.id, null, { fileName: saved.fileName });
    return NextResponse.json(media, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 400 },
    );
  }
}
