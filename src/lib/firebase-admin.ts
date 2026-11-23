import { readFileSync } from "node:fs";
import path from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function firestoreEnabled(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_B64?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}

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

/** بۆ health / diagnosis — بەبێ ئاشکراکردنی نهێنی */
export function firestoreCredentialStatus(): {
  enabled: boolean;
  hasProjectId: boolean;
  hasB64: boolean;
  hasJson: boolean;
  hasInlineKey: boolean;
  hasPath: boolean;
  loadable: boolean;
} {
  const hasProjectId = Boolean(process.env.FIREBASE_PROJECT_ID?.trim());
  const hasB64 = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_B64?.trim());
  const hasJson = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
  const hasInlineKey = Boolean(
    process.env.FIREBASE_PRIVATE_KEY?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      hasProjectId,
  );
  const hasPath = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
  const enabled = firestoreEnabled();
  let loadable = false;
  if (enabled) {
    try {
      loadable = Boolean(loadServiceAccount());
    } catch {
      loadable = false;
    }
  }
  return {
    enabled,
    hasProjectId,
    hasB64,
    hasJson,
    hasInlineKey,
    hasPath,
    loadable,
  };
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

/** Native-mode DB لە bartender-3a68e: id = `default` (نەک `(default)`) */
export function firestoreDatabaseId(): string {
  const id = process.env.FIRESTORE_DATABASE_ID?.trim();
  if (!id || id === "(default)") return "default";
  return id;
}

export function ensureAdminApp() {
  if (!firestoreEnabled()) {
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
      throw new Error(
        "Firebase credential لە Vercel ناگونجێت — FIREBASE_SERVICE_ACCOUNT_B64 یان CLIENT_EMAIL + PRIVATE_KEY (\\n) چاک بکە",
      );
    }
    initializeApp({ credential: applicationDefault() });
  }
}

export function getAdminFirestore() {
  ensureAdminApp();
  return getFirestore(getApps()[0]!, firestoreDatabaseId());
}

export function firestoreStoreDocId(): string {
  return process.env.FIRESTORE_STORE_DOC?.trim() || "bartender-kurd";
}