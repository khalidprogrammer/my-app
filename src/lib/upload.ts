import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Upload storage for Phase 4 (Architecture.md §8 media). The DB keeps metadata
 * only; the bytes live on disk under UPLOAD_DIR/YYYY/MM/ (locally ./data/uploads).
 *
 * Uploads deliberately do NOT live under `public/`. Hosts that build with
 * `output: "standalone"` (Hostinger does) run the server with its cwd inside
 * the regenerated build directory, so anything written to `public/` is
 * destroyed on the next deploy. Point UPLOAD_DIR at a path that survives
 * rebuilds — e.g. /home/u123456789/uploads — and app/uploads/[...path]/route.ts
 * serves the files. Public URLs are /uploads/... either way.
 *
 * Swap saveUploadFile/deleteUploadFile for an S3 adapter when object storage is
 * configured — the media table already fits that model.
 */
export const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? resolve(process.env.UPLOAD_DIR)
  : join(process.cwd(), "data", "uploads");

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Quote attachments may include documents as well as images (Phase 5). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const ALLOWED_ATTACHMENT_MIME: Record<string, string> = {
  ...ALLOWED_IMAGE_MIME,
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
  "text/plain": "txt",
};

/** One path segment, as produced by saveUploadFile: no dots, no separators. */
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Resolves a request path such as `2026/09/abc123.jpg` to an absolute path
 * inside UPLOAD_ROOT, or null for anything this app would never have written.
 * Only 3 or 4 segments are accepted (YYYY/MM/<file>, or <area>/YYYY/MM/<file>),
 * which alone rules out traversal; the resolved-prefix check is defence in
 * depth. Shared with the serving route so reads and writes agree.
 */
export function resolveUploadPath(relPath: string): string | null {
  const parts = relPath.split("/");
  if (parts.length < 3 || parts.length > 4) return null;
  if (parts.some((p) => !SAFE_SEGMENT.test(p))) return null;
  const abs = resolve(UPLOAD_ROOT, ...parts);
  if (!abs.startsWith(UPLOAD_ROOT + sep)) return null;
  return abs;
}

export type SavedUpload = {
  storageKey: string;
  url: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
};

export async function saveUploadFile(
  file: File,
  allowed: Record<string, string> = ALLOWED_IMAGE_MIME,
  options?: { subdir?: string; maxBytes?: number },
): Promise<SavedUpload> {
  const maxBytes = options?.maxBytes ?? MAX_UPLOAD_BYTES;
  if (file.size <= 0) throw new Error("The selected file is empty.");
  if (file.size > maxBytes) {
    throw new Error(`File too large — maximum is ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }
  const ext = allowed[file.type];
  if (!ext) throw new Error("Unsupported file type.");
  // Reject dangerous double extensions (e.g. spec.pdf.exe is already blocked
  // by the MIME map; this guards names like "photo.jpg.svg").
  if (/\.(exe|bat|cmd|msi|ps1|js|html?|svg|php|sh)$/i.test(file.name)) {
    throw new Error("Unsupported file type.");
  }

  const now = new Date();
  const dir = [
    ...(options?.subdir ? [options.subdir] : []),
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
  ];
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  // storageKey keeps the leading "uploads/" so stored URLs stay /uploads/...,
  // matching every row written before this moved off the public/ directory.
  const storageKey = ["uploads", ...dir, name].join("/");
  const absDir = resolve(UPLOAD_ROOT, ...dir);
  await mkdir(absDir, { recursive: true });
  await writeFile(join(absDir, name), Buffer.from(await file.arrayBuffer()));

  return { storageKey, url: `/${storageKey}`, fileName: file.name, mimeType: file.type, fileSize: file.size };
}

/** Best-effort file removal; guarded against path traversal. */
export async function deleteUploadFile(storageKey: string): Promise<void> {
  if (!storageKey.startsWith("uploads/")) return;
  // Reuse the same resolver as the serving route, minus the leading "uploads/".
  const abs = resolveUploadPath(storageKey.slice("uploads/".length));
  if (!abs) return;
  await unlink(abs).catch(() => undefined);
}
