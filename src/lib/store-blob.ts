import { BlobNotFoundError, get, put } from "@vercel/blob";
import type { StoreData } from "./types";
import { vercelBlobEnabled } from "./media-upload";

/** فایلی یەکگرتەی داتا — هەمان store.json لە کلاود */
export const STORE_BLOB_PATH = "shop/store.json";

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

async function readStreamAsText(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const len = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) {
    merged.set(c, off);
    off += c.length;
  }
  return new TextDecoder("utf-8").decode(merged);
}

export async function readStoreFromBlob(): Promise<StoreData | null> {
  const token = blobToken();
  if (!token) return null;
  try {
    const result = await get(STORE_BLOB_PATH, {
      access: "public",
      token,
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await readStreamAsText(result.stream);
    return JSON.parse(raw) as StoreData;
  } catch (e) {
    if (e instanceof BlobNotFoundError) return null;
    throw e;
  }
}

export async function writeStoreToBlob(data: StoreData): Promise<string> {
  const token = blobToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN نییە — Vercel Storage → Blob");
  }
  const body = `${JSON.stringify(data, null, 2)}\n`;
  const blob = await put(STORE_BLOB_PATH, body, {
    access: "public",
    contentType: "application/json; charset=utf-8",
    allowOverwrite: true,
    addRandomSuffix: false,
    token,
  });
  return blob.url;
}