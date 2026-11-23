import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import type { StoreData } from "./types";
import { vercelBlobEnabled } from "./media-upload";
import {
  readStoreFromBlob,
  writeStoreToBlob,
} from "./store-blob";

const storePath = path.join(process.cwd(), "data", "store.json");

export function normalizeStoreData(data: StoreData): StoreData {
  if (!data.slides) data.slides = [];
  if (!data.contacts) data.contacts = [];
  if (!data.brands) data.brands = [];
  if (!data.settings) data.settings = {};
  return data;
}

async function readStoreFromJson(): Promise<StoreData> {
  const raw = await readFile(storePath, "utf8");
  return normalizeStoreData(JSON.parse(raw) as StoreData);
}

async function writeStoreToJson(data: StoreData): Promise<void> {
  await writeFile(storePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** خوێندن — Vercel Blob یان data/store.json */
export async function readRawStore(): Promise<StoreData> {
  try {
    await connection();
  } catch {
    /* ok on some runtimes */
  }

  if (vercelBlobEnabled()) {
    try {
      const fromBlob = await readStoreFromBlob();
      if (fromBlob) return normalizeStoreData(fromBlob);
      const local = await readStoreFromJson();
      await writeStoreToBlob(normalizeStoreData(local)).catch(() => undefined);
      return local;
    } catch (e) {
      console.warn(
        "[store] Blob unavailable, using data/store.json:",
        e instanceof Error ? e.message : e,
      );
    }
  }

  try {
    return await readStoreFromJson();
  } catch {
    return normalizeStoreData({
      categories: [],
      products: [],
      slides: [],
      contacts: [],
      brands: [],
      settings: {},
    });
  }
}

/** نووسین — Vercel Blob لە production، JSON لە لۆکاڵ */
export async function writeRawStore(data: StoreData): Promise<void> {
  const normalized = normalizeStoreData(data);

  if (vercelBlobEnabled()) {
    await writeStoreToBlob(normalized);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "پاشەکەوت ناکرێت — Vercel → Storage → Blob → BLOB_READ_WRITE_TOKEN",
    );
  }

  await writeStoreToJson(normalized);
}

export async function syncJsonToBlob(): Promise<{ ok: boolean; message: string }> {
  if (!vercelBlobEnabled()) {
    return { ok: false, message: "BLOB_READ_WRITE_TOKEN نییە" };
  }
  const local = await readStoreFromJson();
  await writeStoreToBlob(local);
  return { ok: true, message: "store.json → Vercel Blob نێردرا" };
}