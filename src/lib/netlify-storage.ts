import { getStore } from "@netlify/blobs";
import type { StoreData } from "./types";

export const NETLIFY_STORE_DATA_KEY = "shop/store.json";
const STORE_DATA_NAME = "bartinder-shop-data";
const MEDIA_STORE_NAME = "bartinder-shop-media";
const NETLIFY_BLOBS_TIMEOUT_MS = 5_000;
const NETLIFY_BLOBS_FETCH_TIMEOUT_MS = 4_000;

const netlifyBlobsFetch: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    NETLIFY_BLOBS_FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    if (
      response.status === 403 ||
      response.status === 429 ||
      response.status >= 500
    ) {
      return new Response(
        `Netlify Blobs request failed with HTTP ${response.status}`,
        { status: 408 },
      );
    }
    return response;
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Netlify Blobs request failed",
      { status: 408 },
    );
  } finally {
    clearTimeout(timeout);
  }
};

function withNetlifyBlobsTimeout<T>(
  operation: () => Promise<T>,
  description: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () =>
        reject(
          new Error(
            `Netlify Blobs ${description} timed out after ${NETLIFY_BLOBS_TIMEOUT_MS}ms`,
          ),
        ),
      NETLIFY_BLOBS_TIMEOUT_MS,
    );
  });

  return Promise.race([Promise.resolve().then(operation), deadline]).finally(
    () => {
      if (timeout) clearTimeout(timeout);
    },
  );
}

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
    fetch: netlifyBlobsFetch,
  });
}

export async function readStoreFromNetlifyBlobs(): Promise<StoreData | null> {
  const data = await withNetlifyBlobsTimeout(
    () =>
      getNetlifyStore(STORE_DATA_NAME).get(NETLIFY_STORE_DATA_KEY, {
        type: "json",
        consistency: "strong",
      }),
    "store read",
  );
  return data && typeof data === "object" ? (data as StoreData) : null;
}

export async function writeStoreToNetlifyBlobs(data: StoreData): Promise<void> {
  await withNetlifyBlobsTimeout(
    () => getNetlifyStore(STORE_DATA_NAME).setJSON(NETLIFY_STORE_DATA_KEY, data),
    "store write",
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
  await withNetlifyBlobsTimeout(
    () =>
      getNetlifyStore(MEDIA_STORE_NAME).set(key, body, {
        metadata: { contentType },
      }),
    "media write",
  );
  return `/api/media/${encodeURIComponent(filename)}`;
}

export async function readMediaFromNetlifyBlobs(
  filename: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  return withNetlifyBlobsTimeout(async () => {
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
        typeof contentType === "string"
          ? contentType
          : "application/octet-stream",
    };
  }, "media read");
}
