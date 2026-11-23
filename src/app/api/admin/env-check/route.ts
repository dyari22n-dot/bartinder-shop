import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { vercelBlobEnabled } from "@/lib/media-upload";
import {
  readStoreFromBlob,
  STORE_BLOB_PATH,
} from "@/lib/store-blob";

/** پاشەکەوت / خوێندن — تەنها Vercel Blob */
export async function GET() {
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = {
    ok: true,
    storeBackend: "blob",
    vercelBlob: vercelBlobEnabled(),
    blobPath: STORE_BLOB_PATH,
    blobReadOk: false,
    blobCategories: 0,
    hint: null as string | null,
    error: null as string | null,
  };

  if (!body.vercelBlob) {
    body.ok = false;
    body.hint =
      "Vercel → Storage → Blob → Connect → BLOB_READ_WRITE_TOKEN بۆ Production";
    return NextResponse.json(body);
  }

  try {
    const data = await readStoreFromBlob();
    if (data) {
      body.blobReadOk = true;
      body.blobCategories = data.categories?.length ?? 0;
    } else {
      body.hint =
        "یەکەم پاشەکەوت لە ئەدمین store.json → Blob دەکات (یان npm run store:blob-sync)";
    }
  } catch (e) {
    body.ok = false;
    body.error = e instanceof Error ? e.message : String(e);
    body.hint = "تۆکەنی Blob یان Store لە Vercel چەک بکە";
  }

  return NextResponse.json(body);
}