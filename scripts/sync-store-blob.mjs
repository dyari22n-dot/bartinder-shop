/**
 * یەکجار: data/store.json → Vercel Blob
 * npm run store:blob-sync
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const storePath = path.join(root, "data", "store.json");
const BLOB_PATH = "shop/store.json";

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

await loadEnvLocal();
const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN لە .env.local یان env دانەنێ");
  process.exit(1);
}

const json = readFileSync(storePath, "utf8");
const blob = await put(BLOB_PATH, json, {
  access: "public",
  contentType: "application/json; charset=utf-8",
  allowOverwrite: true,
  addRandomSuffix: false,
  token,
});

console.log("OK →", blob.url);
console.log("categories:", JSON.parse(json).categories?.length ?? 0);