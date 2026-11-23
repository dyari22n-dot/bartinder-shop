import { getAuth } from "firebase-admin/auth";
import { getApps } from "firebase-admin/app";
import { ensureAdminApp } from "./firebase-admin";
import { readRawStore } from "./store-persistence";

export { ADMIN_SESSION_COOKIE } from "./admin-cookies";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 5;

export function adminSessionMaxAgeSec(): number {
  return SESSION_MAX_AGE_SEC;
}

export function getAdminAuth() {
  ensureAdminApp();
  return getAuth(getApps()[0]!);
}

export function parseAdminEmailAllowlist(): Set<string> | null {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isEmailAllowedForAdmin(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const envList = parseAdminEmailAllowlist();
  if (envList?.has(normalized)) return true;

  try {
    const store = await readRawStore();
    const fromStore =
      store.settings?.adminEmails?.map((e) => e.trim().toLowerCase()) ?? [];
    if (fromStore.includes(normalized)) return true;
    if (!envList && fromStore.length === 0) return true;
  } catch {
    if (envList?.has(normalized)) return true;
    if (!envList) return true;
  }
  return false;
}