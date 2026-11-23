/**
 * npm run store:firestore-sync
 * پێویست: FIREBASE_* لە .env.local یان service-account.json
 */
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(root, ".env.local"), "utf8");
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
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && email && key) {
    initializeApp({
      credential: cert({ projectId, clientEmail: email, privateKey: key }),
    });
    return getFirestore(getApps()[0], databaseId());
  }
  const rel = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!rel) {
    throw new Error("Set FIREBASE_* in .env.local or FIREBASE_SERVICE_ACCOUNT_PATH");
  }
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
const store = JSON.parse(
  await readFile(path.join(root, "data", "store.json"), "utf8"),
);
const docId = process.env.FIRESTORE_STORE_DOC?.trim() || "bartender-kurd";
const db = initFirebase();
await db
  .collection("stores")
  .doc(docId)
  .set({ payload: store, updatedAt: new Date().toISOString() });
console.log(`Synced → Firestore stores/${docId}`);