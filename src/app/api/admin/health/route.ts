import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { getStoreForAdmin } from "@/lib/db";
import { vercelBlobEnabled } from "@/lib/media-upload";
import { readStoreFromBlob, writeStoreToBlob, STORE_BLOB_PATH } from "@/lib/store-blob";

export async function GET() {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const report = {
    ok: true,
    vercelBlob: vercelBlobEnabled(),
    blobPath: STORE_BLOB_PATH,
    readOk: false,
    writeOk: false,
    counts: { categories: 0, products: 0, brands: 0 },
    error: null as string | null,
    hint: null as string | null,
  };

  try {
    const store = await getStoreForAdmin();
    report.readOk = true;
    report.counts = {
      categories: store.categories?.length ?? 0,
      products: store.products?.length ?? 0,
      brands: store.brands?.length ?? 0,
    };
  } catch (e) {
    report.ok = false;
    report.error = e instanceof Error ? e.message : "read failed";
    return NextResponse.json(report);
  }

  if (!report.vercelBlob) {
    report.hint =
      "Vercel → Storage → Blob → BLOB_READ_WRITE_TOKEN بۆ Production، دواتر Redeploy";
    return NextResponse.json(report);
  }

  try {
    const probe = await readStoreFromBlob();
    if (!probe) {
      report.hint = "یەکەم پاشەکەوت لە ئەدمین Blob دروست دەکات · npm run store:blob-sync";
      return NextResponse.json(report);
    }
    await writeStoreToBlob(probe);
    report.writeOk = true;
  } catch (e) {
    report.ok = false;
    report.error = e instanceof Error ? e.message : "write failed";
    report.hint = "تۆکەنی Blob لە Vercel چەک بکە";
  }

  return NextResponse.json(report);
}