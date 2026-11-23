import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 32;

export function hashAdminPassword(plain: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, KEY_LEN);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyAdminPassword(plain: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(plain, salt, expected.length);
    return (
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}

/** لۆکین ئارەزوومەندانە لە env — `ali:pass123;sara:secret` */
export function verifyEnvLegacyLogin(login: string, password: string): boolean {
  const raw = process.env.ADMIN_LEGACY_USERS?.trim();
  if (!raw) return false;
  const wantLogin = login.trim().toLowerCase();
  for (const part of raw.split(";")) {
    const [name, pass] = part.split(":");
    if (!name?.trim() || pass === undefined) continue;
    if (name.trim().toLowerCase() === wantLogin && pass === password) return true;
  }
  return false;
}