import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { formatStoreError } from "@/lib/action-errors";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { updateCategory } from "@/lib/db";
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
    const categoryId = String(form.get("categoryId") ?? "").trim();
    const file = form.get("file");
    if (!categoryId) {
      return NextResponse.json({ ok: false, error: "بەش هەڵنەبژێردراوە" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "فایل نییە" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `فایل زۆر گەورەیە (>${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB) — وێنەی بچووکتر یان لینک`,
        },
        { status: 400 },
      );
    }

    const raw = Buffer.from(await file.arrayBuffer());
    const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4");
    const isGif = file.type === "image/gif";
    const ext = isVideo ? "mp4" : isGif ? "gif" : "webp";
    const url = await persistMediaFile(raw, {
      ext,
      contentType: file.type || (isVideo ? "video/mp4" : "image/webp"),
      optimizeImage: !isVideo && !isGif,
    });
    await updateCategory(categoryId, { motionMediaUrl: url });
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("[admin/categories/motion]", e);
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