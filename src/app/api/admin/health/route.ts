import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import {
  ensureAdminApp,
  firestoreCredentialStatus,
  firestoreDatabaseId,
  firestoreEnabled,
  getAdminFirestore,
  firestoreStoreDocId,
} from "@/lib/firebase-admin";
import { getStoreForAdmin } from "@/lib/db";
import { vercelBlobEnabled } from "@/lib/media-upload";

export async function GET() {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const creds = firestoreCredentialStatus();
  const report = {
    ok: true,
    firestoreConfigured: creds.enabled,
    credentialLoadable: creds.loadable,
    env: {
      hasProjectId: creds.hasProjectId,
      hasB64: creds.hasB64,
      hasJson: creds.hasJson,
      hasInlineKey: creds.hasInlineKey,
    },
    databaseId: firestoreDatabaseId(),
    storeDoc: firestoreStoreDocId(),
    vercelBlob: vercelBlobEnabled(),
    readOk: false,
    writeOk: false,
    counts: { categories: 0, products: 0, brands: 0 },
    error: null as string | null,
    hint: null as string | null,
  };

  try {
    const store = await getStoreForAdmin();
    report.readOk = true;
    report.counts = {
      categories: store.categories?.length ?? 0,
      products: store.products?.length ?? 0,
      brands: store.brands?.length ?? 0,
    };
  } catch (e) {
    report.ok = false;
    report.error = e instanceof Error ? e.message : "read failed";
    return NextResponse.json(report);
  }

  if (!report.firestoreConfigured) {
    report.hint =
      "لە Vercel Production env نییە FIREBASE_SERVICE_ACCOUNT_B64 — sync-vercel-env.ps1 یان Dashboard، پاشان یەک Redeploy";
  } else if (!report.credentialLoadable) {
    report.hint =
      "env هەیە بەڵام credential ناگونجێت — FIREBASE_SERVICE_ACCOUNT_B64 یان CLIENT_EMAIL + PRIVATE_KEY بپشکنە";
  } else {
    try {
      ensureAdminApp();
      const db = getAdminFirestore();
      await db
        .collection("stores")
        .doc(firestoreStoreDocId())
        .set({ healthPing: new Date().toISOString() }, { merge: true });
      report.writeOk = true;
    } catch (e) {
      report.ok = false;
      report.error = e instanceof Error ? e.message : "write failed";
      report.hint =
        "Firestore ڕێککراوە بەڵام نووسین سەرنەکەوت — databaseId یان IAM لە Firebase";
    }
  }

  return NextResponse.json(report);
}