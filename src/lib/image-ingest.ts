import { MAX_UPLOAD_BYTES } from "./optimize-image";
import { persistMediaFile } from "./media-upload";

/** فایلی وێنە → فشردن → URL */
export async function saveOptimizedImageFile(
  raw: Buffer,
): Promise<{ url: string; bytes: number }> {
  if (raw.length > MAX_UPLOAD_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const url = await persistMediaFile(raw, {
    ext: "webp",
    contentType: "image/webp",
    optimizeImage: true,
  });
  return { url, bytes: raw.length };
}

export async function ingestImageUrl(
  imageUrl: string,
): Promise<string | undefined> {
  const trimmed = imageUrl.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/uploads/")) return trimmed;

  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  const res = await fetch(trimmed, {
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error("FETCH_FAILED");

  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES) throw new Error("FILE_TOO_LARGE");

  const raw = Buffer.from(await res.arrayBuffer());
  if (raw.length > MAX_UPLOAD_BYTES) throw new Error("FILE_TOO_LARGE");

  const { url } = await saveOptimizedImageFile(raw);
  return url;
}