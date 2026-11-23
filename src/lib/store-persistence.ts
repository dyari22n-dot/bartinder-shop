import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import type { StoreData } from "./types";
import {
  firestoreEnabled,
  firestoreStoreDocId,
  getAdminFirestore,
} from "./firebase-admin";

const storePath = path.join(process.cwd(), "data", "store.json");
const FIRESTORE_COLLECTION = "stores";

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

async function readStoreFromFirestore(): Promise<StoreData | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(FIRESTORE_COLLECTION)
    .doc(firestoreStoreDocId())
    .get();
  if (!snap.exists) return null;
  const payload = snap.data()?.payload as StoreData | undefined;
  if (!payload) return null;
  return normalizeStoreData(payload);
}

async function writeStoreToFirestore(data: StoreData): Promise<void> {
  const db = getAdminFirestore();
  await db
    .collection(FIRESTORE_COLLECTION)
    .doc(firestoreStoreDocId())
    .set(
      {
        payload: data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
}

/** خوێندن — Firestore ئەگەر ڕێکخراو بێت، دەیانەوە JSON پاشگەڕ */
export async function readRawStore(): Promise<StoreData> {
  try {
    await connection();
  } catch {
    /* ok on some runtimes */
  }

  if (firestoreEnabled()) {
    try {
      const fromCloud = await readStoreFromFirestore();
      if (fromCloud) return fromCloud;
      const local = await readStoreFromJson();
      await writeStoreToFirestore(local).catch(() => undefined);
      return local;
    } catch (e) {
      console.warn(
        "[store] Firestore unavailable, using data/store.json:",
        e instanceof Error ? e.message : e,
      );
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

/** نووسین — هەمان شوێنی سەرچاوە */
export async function writeRawStore(data: StoreData): Promise<void> {
  try {
    await connection();
  } catch {
    /* runtime */
  }
  const normalized = normalizeStoreData(data);

  if (firestoreEnabled()) {
    try {
      await writeStoreToFirestore(normalized);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[store] Firestore write failed:", msg);
      if (process.env.VERCEL) {
        throw new Error(msg);
      }
      console.warn("[store] falling back to local JSON");
    }
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Firebase لە Vercel دانەنراوە — FIREBASE_SERVICE_ACCOUNT_B64 لە Vercel یان .\\scripts\\sync-vercel-env.ps1",
    );
  }

  await writeStoreToJson(normalized);
}

export async function syncJsonToFirestore(): Promise<{ ok: boolean; message: string }> {
  if (!firestoreEnabled()) {
    return { ok: false, message: "Firebase ڕێکنەخراوە (.env.local)" };
  }
  const local = await readStoreFromJson();
  await writeStoreToFirestore(local);
  return { ok: true, message: "store.json → Firestore نێردرا" };
}