import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";

const emptyStore = {
  categories: [],
  products: [],
  slides: [],
  contacts: [],
  brands: [],
  settings: {},
};

export async function GET() {
  try {
    const jar = await cookies();
    const authed = legacyAuthedFromJar(jar);
    if (!authed) {
      return NextResponse.json({ authed: false });
    }

    try {
      const { getStoreForAdmin } = await import("@/lib/db");
      const store = await getStoreForAdmin();
      return NextResponse.json(
        { authed: true, store },
        {
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        },
      );
    } catch (loadErr) {
      console.error("[admin/me] store:", loadErr);
      return NextResponse.json({ authed: true, store: emptyStore, error: "داتا" });
    }
  } catch (e) {
    console.error("[admin/me]", e);
    return NextResponse.json({ authed: false }, { status: 500 });
  }
}