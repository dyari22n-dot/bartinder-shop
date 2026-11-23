import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { formatStoreError } from "@/lib/action-errors";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { deleteProduct, upsertProduct, type ProductInput } from "@/lib/db";

export async function POST(request: Request) {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as
      | { op: "save"; product: ProductInput & { id?: string } }
      | { op: "delete"; id: string };

    if (body.op === "delete") {
      await deleteProduct(body.id);
      revalidatePath("/");
      revalidatePath("/admin");
      return NextResponse.json({ ok: true });
    }

    if (body.op === "save") {
      const p = body.product;
      if (!p.categoryId || !p.nameCkb?.trim()) {
        return NextResponse.json(
          { ok: false, error: "ناو و بەش پێویستە" },
          { status: 400 },
        );
      }
      const name = p.nameCkb.trim();
      const ar = p.nameAr?.trim();
      const en = p.nameEn?.trim();
      const saved = await upsertProduct({
        ...p,
        nameCkb: name,
        nameAr: ar && ar !== name ? ar : name,
        nameEn: en && en !== name ? en : name,
        priceIqd: Number(p.priceIqd) || 0,
        priceUsd:
          p.priceUsd != null && Number(p.priceUsd) > 0
            ? Number(p.priceUsd)
            : undefined,
        active: p.active ?? true,
        id: p.id,
      });
      revalidatePath("/");
      revalidatePath("/admin");
      return NextResponse.json({ ok: true, product: saved });
    }

    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (e) {
    console.error("[admin/products]", e);
    return NextResponse.json(
      { ok: false, error: formatStoreError(e) },
      { status: 500 },
    );
  }
}