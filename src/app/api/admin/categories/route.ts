import { cookies } from "next/headers";
import { connection, NextResponse } from "next/server";
import { formatStoreError } from "@/lib/action-errors";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import {
  deleteCategory,
  reorderCategories,
  upsertCategory,
  type CategoryInput,
} from "@/lib/db";

export async function POST(request: Request) {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as
      | { op: "save"; category: CategoryInput & { id?: string } }
      | { op: "delete"; id: string }
      | { op: "reorder"; ids: string[] };

    if (body.op === "delete") {
      await deleteCategory(body.id);
      return NextResponse.json({ ok: true });
    }
    if (body.op === "reorder") {
      await reorderCategories(body.ids);
      return NextResponse.json({ ok: true });
    }
    if (body.op === "save") {
      const c = body.category;
      if (!c.nameCkb?.trim()) {
        return NextResponse.json(
          { ok: false, error: "ناوی کوردی پێویستە" },
          { status: 400 },
        );
      }
      const saved = await upsertCategory(c);
      return NextResponse.json({ ok: true, category: saved });
    }
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (e) {
    console.error("[admin/categories]", e);
    return NextResponse.json(
      { ok: false, error: formatStoreError(e) },
      { status: 500 },
    );
  }
}