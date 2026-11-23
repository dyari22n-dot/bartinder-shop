import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { optimizeProductImage } from "./optimize-image";

export function vercelBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function uploadVercelBlob(
  data: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN نییە");
  const blob = await put(`shop/${filename}`, data, {
    access: "public",
    contentType,
    token,
  });
  return blob.url;
}

async function uploadLocal(
  data: Buffer,
  filename: string,
): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), data);
  return `/uploads/${filename}`;
}

const DATA_URL_MAX_BYTES = 220_000;

function toDataUrl(data: Buffer, contentType: string): string {
  if (data.length > DATA_URL_MAX_BYTES) {
    throw new Error(
      "STORAGE_URL_ONLY: وێنە گەورەیە — لە خانەی لینک URL بنووسە یان Vercel Blob چالاک بکە",
    );
  }
  const mime = contentType || "image/webp";
  return `data:${mime};base64,${data.toString("base64")}`;
}

const fallbackAfterNoBlob = (isVideo: boolean): never => {
  if (isVideo) {
    throw new Error(
      "STORAGE_URL_ONLY: ڤیدیۆ پێویستی بە Vercel Blob یان لینکی mp4 هەیە",
    );
  }
  throw new Error("STORAGE_URL_ONLY: Vercel Blob · یان لینکی وێنە");
};

/** وێنە یان media → URL بۆ فرۆشگا */
export async function persistMediaFile(
  raw: Buffer,
  opts: { ext: string; contentType: string; optimizeImage?: boolean },
): Promise<string> {
  let data = raw;
  let ext = opts.ext;
  if (opts.optimizeImage && opts.contentType.startsWith("image/") && opts.contentType !== "image/gif") {
    const out = await optimizeProductImage(raw);
    data = out.data;
    ext = out.ext;
  }
  const filename = `${randomUUID()}.${ext}`;
  const contentType =
    opts.contentType === "image/gif"
      ? "image/gif"
      : opts.contentType.startsWith("video/")
        ? opts.contentType
        : `image/${ext === "jpg" ? "jpeg" : ext}`;

  const isVideo = contentType.startsWith("video/");

  if (vercelBlobEnabled()) {
    try {
      return await uploadVercelBlob(data, filename, contentType);
    } catch (e) {
      console.warn("[media] Vercel Blob failed:", e instanceof Error ? e.message : e);
    }
  }

  if (process.env.VERCEL) {
    if (!isVideo && data.length <= DATA_URL_MAX_BYTES) {
      return toDataUrl(data, contentType);
    }
    fallbackAfterNoBlob(isVideo);
  }

  return uploadLocal(data, filename);
}

export function storageHint(): string {
  if (vercelBlobEnabled()) return "Vercel Blob — وێنە و ڤیدیۆ";
  if (process.env.VERCEL) {
    return "Vercel → Storage → Blob · یان لینکی وێنە/mp4";
  }
  return "لۆکاڵ: public/uploads";
}