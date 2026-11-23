import { cookies } from "next/headers";
import { connection } from "next/server";
import { firebaseAdminEnabled } from "./firebase-admin";
import { getAdminAuth, isEmailAllowedForAdmin } from "./admin-session";
import { ADMIN_COOKIE, ADMIN_SESSION_COOKIE } from "./admin-cookies";
import { legacyAuthedFromCookie } from "./admin-auth";

export function isLegacyAuthed(cookieValue: string | undefined): boolean {
  return legacyAuthedFromCookie(cookieValue);
}

async function verifyAdminSessionCookie(
  session: string | undefined,
): Promise<boolean> {
  if (!session?.trim() || !firebaseAdminEnabled()) return false;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    const email = decoded.email?.trim() ?? "";
    if (!email || decoded.email_verified !== true) return false;
    return await isEmailAllowedForAdmin(email);
  } catch {
    return false;
  }
}

/** پشکنینی کۆکی — بێ Firebase تەنها بۆ legacy */
export async function checkAdminCookies(): Promise<boolean> {
  try {
    await connection();
  } catch {
    /* runtime request */
  }
  const jar = await cookies();
  const legacy = jar.get(ADMIN_COOKIE)?.value;
  if (isLegacyAuthed(legacy)) return true;
  const session = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session?.trim()) return false;
  return verifyAdminSessionCookie(session);
}