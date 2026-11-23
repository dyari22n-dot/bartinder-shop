import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { getStoreForAdmin } from "@/lib/db";
import { vercelBlobEnabled } from "@/lib/media-upload";
import { netlifyBlobsEnabled, netlifyBlobsHint } from "@/lib/netlify-storage";
import { persistentStoreEnabled, writeRawStore } from "@/lib/store-persistence";

export async function GET() {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const report = {
    ok: true,
    vercelBlob: vercelBlobEnabled(),
    netlifyBlobs: netlifyBlobsEnabled(),
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

  if (!persistentStoreEnabled()) {
    report.hint = netlifyBlobsHint();
    return NextResponse.json(report);
  }

  try {
    const store = await getStoreForAdmin();
    await writeRawStore(store);
    report.writeOk = true;
  } catch (e) {
    report.ok = false;
    report.error = e instanceof Error ? e.message : "write failed";
    report.hint = "Netlify Blobs یان Blob storage چەک بکە";
  }

  return NextResponse.json(report);
}