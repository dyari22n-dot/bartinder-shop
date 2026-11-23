import { readRawStore } from "./store-persistence";
import { verifyAdminPassword, verifyEnvLegacyLogin } from "./admin-password";
import { ADMIN_COOKIE, LEGACY_AUTH_TOKEN } from "./admin-cookies";

export { ADMIN_COOKIE, LEGACY_AUTH_TOKEN } from "./admin-cookies";

export function masterAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "bartender2026";
}

export function isMasterLogin(login: string, password: string): boolean {
  const l = login.trim().toLowerCase();
  if (password !== masterAdminPassword()) return false;
  return !l || l === "admin" || l === "bartender" || l === "master";
}

export async function verifyAdminLogin(
  login: string,
  password: string,
): Promise<boolean> {
  if (!password) return false;
  if (isMasterLogin(login, password)) return true;
  if (verifyEnvLegacyLogin(login, password)) return true;

  try {
    const store = await readRawStore();
    const accounts = store.settings?.adminLegacyAccounts ?? [];
    const want = login.trim().toLowerCase();
    for (const acc of accounts) {
      if (acc.login.trim().toLowerCase() !== want) continue;
      if (verifyAdminPassword(password, acc.passwordHash)) return true;
    }
  } catch {
    /* only env/master */
  }
  return false;
}

export function legacyAuthedFromCookie(cookieValue: string | undefined): boolean {
  return cookieValue === LEGACY_AUTH_TOKEN;
}

export function legacyAuthedFromJar(jar: {
  get: (name: string) => { value: string } | undefined;
}): boolean {
  return legacyAuthedFromCookie(jar.get(ADMIN_COOKIE)?.value);
}

/** تەنها ناوەکان بۆ UI */
export function loginsFromEnv(): string[] {
  const raw = process.env.ADMIN_LEGACY_USERS?.trim();
  if (!raw) return [];
  return raw
    .split(";")
    .map((part) => part.split(":")[0]?.trim().toLowerCase())
    .filter(Boolean) as string[];
}

export function suggestedLegacyUsersEnv(login: string, password: string): string {
  const raw = process.env.ADMIN_LEGACY_USERS?.trim();
  const entry = `${login.trim().toLowerCase()}:${password}`;
  return raw ? `${raw};${entry}` : entry;
}