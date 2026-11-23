import { stat } from "node:fs/promises";
import path from "node:path";
import type { Category } from "./types";

/** جیاکردنەوەی cache کاتێک هەمان ناو لە public/uploads دەگۆڕدرێت */
export async function motionUrlWithCacheBust(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) return undefined;
  const base = url.split("?")[0];
  if (!base.startsWith("/")) return url;

  const filePath = path.join(process.cwd(), "public", base.replace(/^\//, ""));
  try {
    const { mtimeMs, size } = await stat(filePath);
    return `${base}?v=${Math.round(mtimeMs)}&s=${size}`;
  } catch {
    return url;
  }
}

async function publicUploadExists(relativePath: string): Promise<boolean> {
  const filePath = path.join(process.cwd(), "public", relativePath);
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/** ڕێکخستنی ڤیدیۆ: store.json یان uploads/{slug}-motion.mp4 */
export async function resolveCategoryMotionUrl(
  cat: Category,
): Promise<string | undefined> {
  const explicit = cat.motionMediaUrl?.split("?")[0];
  if (explicit) {
    return motionUrlWithCacheBust(explicit);
  }

  const slugPath = `/uploads/${cat.slug}-motion.mp4`;
  if (await publicUploadExists(slugPath.replace(/^\//, ""))) {
    return motionUrlWithCacheBust(slugPath);
  }

  return undefined;
}