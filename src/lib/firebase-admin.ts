import { readFileSync } from "node:fs";
import path from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";

/** تەنها بۆ Firebase Auth (ئیمەیڵی فرۆشیار) — داتای فرۆشگا لە Vercel Blob */
export function firebaseAdminEnabled(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_B64?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}

/** @deprecated ناوی کۆن — تەنها Auth */
export const firestoreEnabled = firebaseAdminEnabled;

function normalizePrivateKey(key: string): string {
  let k = key.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, "\n");
}

function parseServiceAccountJson(
  raw: string,
): { projectId: string; clientEmail: string; privateKey: string } | undefined {
  try {
    const json = JSON.parse(raw) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!json.client_email || !json.private_key) return undefined;
    return {
      projectId: json.project_id ?? "",
      clientEmail: json.client_email,
      privateKey: normalizePrivateKey(json.private_key),
    };
  } catch {
    return undefined;
  }
}

function loadServiceAccount():
  | { projectId: string; clientEmail: string; privateKey: string }
  | undefined {
  const b64Raw = process.env.FIREBASE_SERVICE_ACCOUNT_B64?.trim();
  if (b64Raw) {
    const b64 = b64Raw.replace(/\s+/g, "");
    try {
      const raw = Buffer.from(b64, "base64").toString("utf8");
      const fromJson = parseServiceAccountJson(raw);
      if (fromJson) return fromJson;
    } catch {
      /* try other methods */
    }
  }

  const embedded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (embedded) {
    const fromJson = parseServiceAccountJson(embedded);
    if (fromJson) return fromJson;
  }

  const inline = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (inline && email && projectId) {
    return {
      projectId,
      clientEmail: email,
      privateKey: normalizePrivateKey(inline),
    };
  }

  const rel =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!rel) return undefined;

  const filePath = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  if (!raw.client_email || !raw.private_key) return undefined;
  return {
    projectId: raw.project_id ?? projectId ?? "",
    clientEmail: raw.client_email,
    privateKey: raw.private_key,
  };
}

export function ensureAdminApp() {
  if (!firebaseAdminEnabled()) {
    throw new Error("Firebase is not configured");
  }
  if (!getApps().length) {
    const account = loadServiceAccount();
    if (account?.clientEmail && account?.privateKey) {
      initializeApp({
        credential: cert({
          projectId: account.projectId || process.env.FIREBASE_PROJECT_ID?.trim(),
          clientEmail: account.clientEmail,
          privateKey: account.privateKey,
        }),
      });
      return;
    }
    if (process.env.VERCEL) {
      throw new Error("Firebase credential لە Vercel ناگونجێت");
    }
    initializeApp({ credential: applicationDefault() });
  }
}