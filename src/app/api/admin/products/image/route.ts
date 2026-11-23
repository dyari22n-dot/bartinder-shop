import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { formatStoreError } from "@/lib/action-errors";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { persistMediaFile, storageHint } from "@/lib/media-upload";
import { MAX_UPLOAD_BYTES } from "@/lib/optimize-image";

export async function POST(request: Request) {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "وێنە نییە" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ ok: false, error: "وێنە زۆر گەورەیە" }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const isGif = file.type === "image/gif";
    const url = await persistMediaFile(raw, {
      ext: isGif ? "gif" : "webp",
      contentType: file.type || "image/webp",
      optimizeImage: !isGif,
    });
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("[admin/products/image]", e);
    const text = formatStoreError(e);
    return NextResponse.json(
      {
        ok: false,
        error: text.includes("لینک") ? text : `${text} · ${storageHint()}`,
      },
      { status: 500 },
    );
  }
}