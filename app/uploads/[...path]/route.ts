import { readFile } from "node:fs/promises";
import { ALLOWED_ATTACHMENT_MIME, ALLOWED_IMAGE_MIME, resolveUploadPath } from "@/lib/upload";

/**
 * GET /uploads/<YYYY|MM>/.../<file> — serves admin-uploaded media from
 * UPLOAD_ROOT (Architecture.md §8).
 *
 * Uploads are stored outside `public/` so they survive rebuilds on hosts that
 * build with `output: "standalone"`, which means Next's static file handler no
 * longer covers them and this route has to. The URLs are unchanged
 * (`media.url` is still `/uploads/...`), so nothing else needs to know.
 */

/** Extension -> Content-Type, derived from the MIME maps that gate uploads. */
const IMAGE_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_IMAGE_MIME).map(([mime, ext]) => [ext, mime]),
);

const DOCUMENT_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_ATTACHMENT_MIME)
    .filter(([mime]) => !(mime in ALLOWED_IMAGE_MIME))
    .map(([mime, ext]) => [ext, mime]),
);

function extname(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const abs = resolveUploadPath(path.join("/"));
  if (!abs) return new Response("Not found", { status: 404 });

  const ext = extname(path[path.length - 1] ?? "");
  const isImage = ext in IMAGE_TYPES;
  // Only extensions this app can produce are served; a PDF/CSV/etc. is forced
  // to download so a hostile file can never render in the site's origin.
  if (!isImage && !(ext in DOCUMENT_TYPES)) return new Response("Not found", { status: 404 });

  let body: Buffer;
  try {
    body = await readFile(abs);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": isImage ? IMAGE_TYPES[ext] : DOCUMENT_TYPES[ext],
      "Content-Length": String(body.byteLength),
      // Filenames are 12 random bytes, so a given URL always maps to the same
      // bytes and can be cached hard. next/image revalidates on content change.
      "Cache-Control": isImage
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600, must-revalidate",
      ...(isImage ? {} : { "Content-Disposition": `attachment; filename="${path[path.length - 1]}"` }),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
