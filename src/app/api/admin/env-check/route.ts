import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { getStoreForAdmin } from "@/lib/db";
import { vercelBlobEnabled } from "@/lib/media-upload";
import { netlifyBlobsEnabled } from "@/lib/netlify-storage";
import { persistentStoreEnabled } from "@/lib/store-persistence";

export async function GET() {
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = {
    ok: true,
    storeBackend: netlifyBlobsEnabled()
      ? "Netlify Blobs"
      : vercelBlobEnabled()
        ? "Vercel Blob"
        : "local",
    vercelBlob: vercelBlobEnabled(),
    netlifyBlobs: netlifyBlobsEnabled(),
    blobReadOk: false,
    blobCategories: 0,
    hint: null as string | null,
    error: null as string | null,
  };

  if (!persistentStoreEnabled()) {
    body.ok = false;
    body.hint =
      "پاشەکەوتی کلاود ڕێکنەخراوە";
    return NextResponse.json(body);
  }

  try {
    const data = await getStoreForAdmin();
    body.blobReadOk = true;
    body.blobCategories = data.categories?.length ?? 0;
  } catch (e) {
    body.ok = false;
    body.error = e instanceof Error ? e.message : String(e);
    body.hint = "تۆکەنی Blob یان Store لە Vercel چەک بکە";
  }

  return NextResponse.json(body);
}