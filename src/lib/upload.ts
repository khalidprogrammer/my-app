import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Local upload storage for Phase 4 (Architecture.md §8 media).
 * Files live under public/uploads/YYYY/MM/; the DB keeps metadata only.
 * Swap saveUploadFile/deleteUploadFile for an S3 adapter when object
 * storage is configured — the media table already fits that model.
 */
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
    "uploads",
    ...(options?.subdir ? [options.subdir] : []),
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
  ];
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const storageKey = [...dir, name].join("/");
  const absDir = join(process.cwd(), "public", ...dir);
  await mkdir(absDir, { recursive: true });
  await writeFile(join(absDir, name), Buffer.from(await file.arrayBuffer()));

  return { storageKey, url: `/${storageKey}`, fileName: file.name, mimeType: file.type, fileSize: file.size };
}

/** Best-effort file removal; guarded against path traversal. */
export async function deleteUploadFile(storageKey: string): Promise<void> {
  if (!storageKey.startsWith("uploads/")) return;
  const parts = storageKey.split("/");
  // Only keys we ever create: uploads/YYYY/MM/<file> or uploads/<area>/YYYY/MM/<file>.
  if (parts.length < 3 || parts.length > 5) return;
  if (parts.some((p) => p === "" || p === "." || p === "..")) return;
  const fileName = parts[parts.length - 1] ?? "";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(fileName)) return;
  await unlink(join(process.cwd(), "public", ...parts)).catch(() => undefined);
}
