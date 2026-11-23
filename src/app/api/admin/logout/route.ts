import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/admin-cookies";

function clearAuthCookie(jar: Awaited<ReturnType<typeof cookies>>, name: string) {
  jar.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
  });
}

export async function POST() {
  await connection();
  const jar = await cookies();
  clearAuthCookie(jar, ADMIN_COOKIE);
  clearAuthCookie(jar, ADMIN_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}