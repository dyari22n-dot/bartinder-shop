/**
 * npm run deploy:env-hint
 * ڕێنمایی env بۆ Vercel (کلیل لە console دەردەکەوێت — کۆپی بکە بۆ Vercel dashboard)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const accountPath = path.join(root, "firebase-service-account.json");

try {
  const json = JSON.parse(readFileSync(accountPath, "utf8"));
  console.log("Vercel → Settings → Environment Variables:\n");
  console.log("FIREBASE_PROJECT_ID=" + json.project_id);
  console.log("FIREBASE_CLIENT_EMAIL=" + json.client_email);
  console.log(
    "FIREBASE_PRIVATE_KEY=(paste full private key, use \\n for newlines)",
  );
  console.log("\nOr one variable:");
  console.log("FIREBASE_SERVICE_ACCOUNT_JSON=(minify JSON, one line)\n");
  console.log("FIRESTORE_DATABASE_ID=default");
  console.log("FIRESTORE_STORE_DOC=bartender-kurd");
  console.log("ADMIN_PASSWORD=your-strong-password");
  console.log("NEXT_PUBLIC_SITE_URL=https://YOUR-PROJECT.vercel.app");
} catch {
  console.log("firebase-service-account.json not found in project root.");
}