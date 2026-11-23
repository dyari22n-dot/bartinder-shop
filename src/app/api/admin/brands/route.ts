import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { connection, NextResponse } from "next/server";
import { formatStoreError } from "@/lib/action-errors";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { deleteBrand, upsertBrand, type BrandInput } from "@/lib/db";

export async function POST(request: Request) {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as
      | { op: "save"; brand: BrandInput & { id?: string } }
      | { op: "delete"; id: string };

    if (body.op === "delete") {
      await deleteBrand(body.id);
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/brands");
      return NextResponse.json({ ok: true });
    }

    if (body.op === "save") {
      const b = body.brand;
      if (!b.nameCkb?.trim()) {
        return NextResponse.json(
          { ok: false, error: "ناوی کوردی پێویستە" },
          { status: 400 },
        );
      }
      if (!b.categoryIds?.length) {
        return NextResponse.json(
          { ok: false, error: "لانیکەم یەک بەش هەڵبژێرە" },
          { status: 400 },
        );
      }
      await upsertBrand(b);
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/brands");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (e) {
    console.error("[admin/brands]", e);
    return NextResponse.json(
      { ok: false, error: formatStoreError(e) },
      { status: 500 },
    );
  }
}