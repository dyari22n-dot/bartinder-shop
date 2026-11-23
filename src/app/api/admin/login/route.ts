import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_COOKIE, LEGACY_AUTH_TOKEN } from "@/lib/admin-cookies";
import { verifyAdminLogin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  await connection();
  let login = "";
  let password = "";
  try {
    const body = (await request.json()) as { login?: string; password?: string };
    login = body.login?.trim() ?? "";
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  if (!(await verifyAdminLogin(login, password))) {
    return NextResponse.json({ ok: false, error: "wrong" }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, LEGACY_AUTH_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  jar.delete(ADMIN_SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}