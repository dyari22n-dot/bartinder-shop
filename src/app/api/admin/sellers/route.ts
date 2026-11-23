import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  legacyAuthedFromJar,
  loginsFromEnv,
  suggestedLegacyUsersEnv,
} from "@/lib/admin-auth";
import { hashAdminPassword } from "@/lib/admin-password";
import { getStoreForAdmin, updateStoreSettings } from "@/lib/db";
import type { AdminLegacyAccount } from "@/lib/types";

export async function GET() {
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const fromEnv = loginsFromEnv();
  let fromStore: string[] = [];
  try {
    const store = await getStoreForAdmin();
    fromStore = store.settings?.adminLegacyAccounts?.map((a) => a.login) ?? [];
  } catch {
    /* env only */
  }

  const logins = [...new Set([...fromStore, ...fromEnv])];
  return NextResponse.json({
    ok: true,
    logins,
    canPersistToCloud: fromStore.length > 0 || process.env.VERCEL !== "1",
  });
}

export async function POST(request: Request) {
  try {
    const jar = await cookies();
    if (!legacyAuthedFromJar(jar)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      add?: { login: string; password: string };
      remove?: string;
    };

    if (body.remove?.trim()) {
      const r = body.remove.trim().toLowerCase();
      try {
        const store = await getStoreForAdmin();
        const accounts = (store.settings?.adminLegacyAccounts ?? []).filter(
          (a) => a.login.trim().toLowerCase() !== r,
        );
        await updateStoreSettings({ adminLegacyAccounts: accounts });
        const logins = [...new Set([...accounts.map((a) => a.login), ...loginsFromEnv()])];
        return NextResponse.json({ ok: true, logins });
      } catch {
        return NextResponse.json({
          ok: false,
          error: "سڕینەوە لە Vercel env (ADMIN_LEGACY_USERS) دەستی بکە",
        });
      }
    }

    if (!body.add) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const login = body.add.login?.trim().toLowerCase();
    const password = body.add.password ?? "";
    if (!login || login.length < 2) {
      return NextResponse.json({ ok: false, error: "ناو کەم لە ٢ پیت" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "وشەی نهێنی ٦+ پیت" }, { status: 400 });
    }

    try {
      const store = await getStoreForAdmin();
      let accounts: AdminLegacyAccount[] = [
        ...(store.settings?.adminLegacyAccounts ?? []).filter(
          (a) => a.login.trim().toLowerCase() !== login,
        ),
      ];
      accounts.push({ login, passwordHash: hashAdminPassword(password) });
      await updateStoreSettings({ adminLegacyAccounts: accounts });
      const logins = [...new Set([...accounts.map((a) => a.login), ...loginsFromEnv()])];
      return NextResponse.json({ ok: true, logins, saved: "firestore" });
    } catch (e) {
      const vercelLine = suggestedLegacyUsersEnv(login, password);
      return NextResponse.json(
        {
          ok: true,
          saved: "env",
          logins: [...new Set([...loginsFromEnv(), login])],
          vercelEnv: {
            name: "ADMIN_LEGACY_USERS",
            value: vercelLine,
          },
          message:
            "لە کلاود نەنووسرا — ئەم فڕە لە Vercel Env زیاد بکە، دواتر npx vercel --prod",
          detail: e instanceof Error ? e.message.slice(0, 120) : undefined,
        },
        { status: 200 },
      );
    }
  } catch (e) {
    console.error("[admin/sellers]", e);
    return NextResponse.json({ ok: false, error: "هەڵەی سێرڤەر" }, { status: 500 });
  }
}