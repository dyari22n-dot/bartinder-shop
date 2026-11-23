import { getStore } from "@netlify/blobs";
import type { StoreData } from "./types";

export const NETLIFY_STORE_DATA_KEY = "shop/store.json";
const STORE_DATA_NAME = "bartinder-shop-data";
const MEDIA_STORE_NAME = "bartinder-shop-media";

export function netlifyBlobsEnabled(): boolean {
  return (
    Boolean(
      process.env.NETLIFY_SITE_ID?.trim() &&
        process.env.NETLIFY_AUTH_TOKEN?.trim(),
    )
  );
}

export function netlifyBlobsHint(): string {
  if (!process.env.NETLIFY_SITE_ID?.trim()) {
    return "Netlify Site ID ڕێکنەخراوە";
  }
  if (!process.env.NETLIFY_AUTH_TOKEN?.trim()) {
    return "NETLIFY_AUTH_TOKEN لە Netlify Environment variables زیاد بکە";
  }
  return "Netlify Blobs چالاکە";
}

function getNetlifyStore(name: string) {
  const siteID = process.env.NETLIFY_SITE_ID?.trim();
  const token = process.env.NETLIFY_AUTH_TOKEN?.trim();
  return getStore(name, {
    ...(siteID && token ? { siteID, token } : {}),
  });
}

export async function readStoreFromNetlifyBlobs(): Promise<StoreData | null> {
  const data = await getNetlifyStore(STORE_DATA_NAME).get(
    NETLIFY_STORE_DATA_KEY,
    { type: "json", consistency: "strong" },
  );
  return data && typeof data === "object" ? (data as StoreData) : null;
}

export async function writeStoreToNetlifyBlobs(data: StoreData): Promise<void> {
  await getNetlifyStore(STORE_DATA_NAME).setJSON(
    NETLIFY_STORE_DATA_KEY,
    data,
  );
}

export async function writeMediaToNetlifyBlobs(
  filename: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  const key = `shop/${filename}`;
  const bytes = Uint8Array.from(data);
  const body = new Blob([bytes], { type: contentType });
  await getNetlifyStore(MEDIA_STORE_NAME).set(key, body, {
    metadata: { contentType },
  });
  return `/api/media/${encodeURIComponent(filename)}`;
}

export async function readMediaFromNetlifyBlobs(
  filename: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const store = getNetlifyStore(MEDIA_STORE_NAME);
  const entry = await store.getMetadata(`shop/${filename}`, {
    consistency: "strong",
  });
  if (!entry) return null;

  const data = await store.get(`shop/${filename}`, {
    type: "arrayBuffer",
    consistency: "strong",
  });
  const contentType = entry.metadata.contentType;
  return {
    data,
    contentType:
      typeof contentType === "string" ? contentType : "application/octet-stream",
  };
}
