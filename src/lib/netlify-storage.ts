import { getStore } from "@netlify/blobs";
import type { StoreData } from "./types";

export const NETLIFY_STORE_DATA_KEY = "shop/store.json";
const STORE_DATA_NAME = "bartinder-shop-data";
const MEDIA_STORE_NAME = "bartinder-shop-media";
const NETLIFY_REGION = "eu-central-1";

export function netlifyBlobsEnabled(): boolean {
  return (
    process.env.NETLIFY === "true" ||
    Boolean(process.env.NETLIFY_SITE_ID || process.env.CONTEXT)
  );
}

export async function readStoreFromNetlifyBlobs(): Promise<StoreData | null> {
  const data = await getStore(STORE_DATA_NAME, {
    region: NETLIFY_REGION,
    consistency: "strong",
  }).get(NETLIFY_STORE_DATA_KEY, { type: "json" });
  return data && typeof data === "object" ? (data as StoreData) : null;
}

export async function writeStoreToNetlifyBlobs(data: StoreData): Promise<void> {
  await getStore(STORE_DATA_NAME, { region: NETLIFY_REGION }).setJSON(
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
  await getStore(MEDIA_STORE_NAME, { region: NETLIFY_REGION }).set(key, body, {
    metadata: { contentType },
  });
  return `/api/media/${encodeURIComponent(filename)}`;
}

export async function readMediaFromNetlifyBlobs(
  filename: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const store = getStore(MEDIA_STORE_NAME, { region: NETLIFY_REGION });
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
