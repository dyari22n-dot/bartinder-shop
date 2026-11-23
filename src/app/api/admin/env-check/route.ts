import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import {
  ensureAdminApp,
  firestoreCredentialStatus,
  firestoreDatabaseId,
  firestoreEnabled,
  firestoreStoreDocId,
  getAdminFirestore,
} from "@/lib/firebase-admin";

/** بەخێرایی — credential و خوێندن لە Firestore (بێ mergeی store) */
export async function GET() {
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const creds = firestoreCredentialStatus();
  const body = {
    ok: true,
    firestoreEnabled: firestoreEnabled(),
    credentialLoadable: creds.loadable,
    env: {
      hasProjectId: creds.hasProjectId,
      hasB64: creds.hasB64,
      hasJson: creds.hasJson,
      hasInlineKey: creds.hasInlineKey,
      databaseId: firestoreDatabaseId(),
      storeDoc: firestoreStoreDocId(),
      hasFirestoreDatabaseIdVar: Boolean(
        process.env.FIRESTORE_DATABASE_ID?.trim(),
      ),
      hasFirestoreStoreDocVar: Boolean(process.env.FIRESTORE_STORE_DOC?.trim()),
    },
    firestoreRead: false as boolean,
    updatedAt: null as string | null,
    error: null as string | null,
    hint: null as string | null,
  };

  if (!body.firestoreEnabled) {
    body.ok = false;
    body.hint =
      "FIREBASE_* لە Vercel Production نییە — sync-vercel-env.ps1 یان Dashboard";
    return NextResponse.json(body);
  }

  if (!body.credentialLoadable) {
    body.ok = false;
    body.hint =
      "ناوەکان هەن بەڵام credential ناگونجێت — B64 بە sync-vercel-env.ps1 دوبارە بنێرە یان PRIVATE_KEY بە \\n";
    return NextResponse.json(body);
  }

  try {
    ensureAdminApp();
    const db = getAdminFirestore();
    const snap = await db
      .collection("stores")
      .doc(firestoreStoreDocId())
      .get();
    body.firestoreRead = snap.exists;
    body.updatedAt = (snap.data()?.updatedAt as string | undefined) ?? null;
    if (!snap.exists) {
      body.hint =
        "Firestore پەیوەندی OK — بەڵام doc نییە؛ npm run store:firestore-sync";
    }
  } catch (e) {
    body.ok = false;
    body.error = e instanceof Error ? e.message : String(e);
    body.hint =
      "databaseId یان IAM — FIRESTORE_DATABASE_ID=default، FIRESTORE_STORE_DOC=bartender-kurd";
  }

  return NextResponse.json(body);
}