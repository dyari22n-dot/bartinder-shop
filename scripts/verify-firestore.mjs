/**
 * npm run store:firestore-check
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadEnvLocal() {
  try {
    const raw = await import("node:fs/promises").then((fs) =>
      fs.readFile(path.join(root, ".env.local"), "utf8"),
    );
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* optional */
  }
}

function databaseId() {
  return process.env.FIRESTORE_DATABASE_ID?.trim() || "(default)";
}

function initFirebase() {
  const app = getApps()[0];
  if (app) return getFirestore(app, databaseId());
  const rel = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!rel) throw new Error(".env.local: FIREBASE_SERVICE_ACCOUNT_PATH نییە");
  const accountPath = path.isAbsolute(rel) ? rel : path.join(root, rel);
  const json = JSON.parse(readFileSync(accountPath, "utf8"));
  initializeApp({
    credential: cert({
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key,
    }),
  });
  return getFirestore(getApps()[0], databaseId());
}

await loadEnvLocal();
const docId = process.env.FIRESTORE_STORE_DOC?.trim() || "bartender-kurd";
const db = initFirebase();
const snap = await db.collection("stores").doc(docId).get();
if (!snap.exists) {
  console.log("Firestore پەیوەندی OK — بەڵام doc نییە. npm run store:firestore-sync");
  process.exit(0);
}
const p = snap.data()?.payload;
console.log("OK Firestore", {
  project: process.env.FIREBASE_PROJECT_ID || "(service account)",
  doc: `stores/${docId}`,
  categories: p?.categories?.length ?? 0,
  brands: p?.brands?.length ?? 0,
  products: p?.products?.length ?? 0,
  contacts: p?.contacts?.length ?? 0,
  updatedAt: snap.data()?.updatedAt,
});