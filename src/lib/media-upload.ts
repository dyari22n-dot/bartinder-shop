import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { ensureAdminApp, firestoreEnabled } from "./firebase-admin";
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

function storageBucketName(): string {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (explicit) return explicit;
  const project = process.env.FIREBASE_PROJECT_ID?.trim() || "bartender-3a68e";
  return `${project}.firebasestorage.app`;
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

/** زیاتر لە ئەمە data:URL لە یەک doc Firestore زۆرە — Blaze نییە: لینک بەکاربهێنە */
const DATA_URL_MAX_BYTES = 220_000;

function isMissingStorageBucket(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("The specified bucket does not exist") ||
    msg.includes("bucket does not exist") ||
    msg.includes('"code": 404') && msg.includes("bucket")
  );
}

function toDataUrl(data: Buffer, contentType: string): string {
  if (data.length > DATA_URL_MAX_BYTES) {
    throw new Error(
      "STORAGE_URL_ONLY: وێنە گەورەیە — لە خانەی لینک URL بنووسە (Storage لە Firebase چالاک نییە)",
    );
  }
  const mime = contentType || "image/webp";
  return `data:${mime};base64,${data.toString("base64")}`;
}

async function uploadFirebase(
  data: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  ensureAdminApp();
  const bucket = getStorage(getApps()[0]!).bucket(storageBucketName());
  const dest = `shop/${filename}`;
  const file = bucket.file(dest);
  await file.save(data, {
    metadata: { contentType, cacheControl: "public, max-age=31536000" },
  });
  try {
    await file.makePublic();
  } catch {
    /* uniform access buckets */
  }
  return `https://storage.googleapis.com/${bucket.name}/${dest}`;
}

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

  const tryFirebase = async (): Promise<string> => {
    if (!firestoreEnabled()) {
      throw new Error("Firebase لە Vercel دانەنراوە");
    }
    return uploadFirebase(data, filename, contentType);
  };

  const fallbackAfterBucketError = (): string => {
    if (isVideo) {
      throw new Error(
        "STORAGE_URL_ONLY: ڤیدیۆ پێویستی بە Storage یان لینکی mp4 هەیە",
      );
    }
    return toDataUrl(data, contentType);
  };

  if (process.env.VERCEL) {
    if (vercelBlobEnabled()) {
      try {
        return await uploadVercelBlob(data, filename, contentType);
      } catch (e) {
        console.warn("[media] Vercel Blob failed:", e instanceof Error ? e.message : e);
      }
    }
    try {
      return await tryFirebase();
    } catch (e) {
      if (isMissingStorageBucket(e)) return fallbackAfterBucketError();
      throw e;
    }
  }
  if (firestoreEnabled()) {
    try {
      return await uploadFirebase(data, filename, contentType);
    } catch (e) {
      if (isMissingStorageBucket(e)) return fallbackAfterBucketError();
      /* local fallback below */
    }
  }
  return uploadLocal(data, filename);
}

export function storageHint(): string {
  if (vercelBlobEnabled()) return "Vercel Blob";
  if (!firestoreEnabled()) {
    return "Firebase env لە Vercel نییە — .\scripts\sync-vercel-env.ps1";
  }
  return "Vercel Dashboard → Storage → Blob · یان لینکی وێنە";
}