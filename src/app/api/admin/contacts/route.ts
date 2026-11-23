import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { connection, NextResponse } from "next/server";
import { formatStoreError } from "@/lib/action-errors";
import { legacyAuthedFromJar } from "@/lib/admin-auth";
import { deleteContact, upsertContact, type ContactLinkInput } from "@/lib/db";

export async function POST(request: Request) {
  await connection();
  const jar = await cookies();
  if (!legacyAuthedFromJar(jar)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as
      | { op: "save"; contact: ContactLinkInput & { id?: string } }
      | { op: "delete"; id: string };

    if (body.op === "delete") {
      await deleteContact(body.id);
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/contact");
      return NextResponse.json({ ok: true });
    }

    if (body.op === "save") {
      const c = body.contact;
      if (!c.labelCkb?.trim()) {
        return NextResponse.json(
          { ok: false, error: "ناونیشان پێویستە" },
          { status: 400 },
        );
      }
      if (!c.phone?.trim() && !c.href?.trim()) {
        return NextResponse.json(
          { ok: false, error: "ژمارە یان لینک پێویستە" },
          { status: 400 },
        );
      }
      await upsertContact(c);
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/contact");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  } catch (e) {
    console.error("[admin/contacts]", e);
    return NextResponse.json(
      { ok: false, error: formatStoreError(e) },
      { status: 500 },
    );
  }
}