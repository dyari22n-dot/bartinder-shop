"use client";

import Image from "next/image";
import { reloadAdmin } from "@/lib/admin-mutate";
import { useRef, useState, useTransition } from "react";
import type { Product, PromoSlide, PromoSlideKind } from "@/lib/types";
import {
  deleteSlideAction,
  saveSlideAction,
  uploadProductImageAction,
} from "@/lib/actions";

type Props = {
  slides: PromoSlide[];
  products: Product[];
};

export function AdminSlides({ slides, products }: Props) {
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Partial<PromoSlide> & { isNew?: boolean }>(
    {},
  );

  const showForm = Boolean(editing.isNew || editing.id);

  const startNew = () =>
    setEditing({
      isNew: true,
      kind: "offer",
      titleCkb: "",
      titleAr: "",
      titleEn: "",
      active: true,
      sortOrder: slides.length + 1,
    });

  const uploadSlideImage = async (file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    const res = await uploadProductImageAction(formData);
    if (res.ok && res.url) setEditing((s) => ({ ...s, imageUrl: res.url }));
  };

  const save = () =>
    start(async () => {
      const payload = {
        kind: (editing.kind ?? "offer") as PromoSlideKind,
        titleCkb: editing.titleCkb ?? "",
        titleAr: editing.titleAr ?? "",
        titleEn: editing.titleEn ?? "",
        subtitleCkb: editing.subtitleCkb,
        subtitleAr: editing.subtitleAr,
        subtitleEn: editing.subtitleEn,
        imageUrl: editing.imageUrl,
        productId: editing.productId || undefined,
        href: editing.href || undefined,
        discountPercent: editing.discountPercent,
        active: editing.active ?? true,
        sortOrder: Number(editing.sortOrder) || 0,
        id: editing.isNew ? undefined : editing.id,
      };
      await saveSlideAction(payload);
      setEditing({});
      reloadAdmin();
    });

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <p className="mb-0.5 text-[10px] font-semibold text-bk-accent">هەنگاو ٥</p>
      <h2 className="mb-2 text-sm font-bold text-bk-accent">سلاید (ئۆفەر / داشکاندن)</h2>
      <p className="mb-3 text-xs text-bk-muted">
        لە سەرەوەی سەرەکی — بە slide دەجوڵێت.
      </p>
      <button type="button" className="btn-outline mb-3 w-full" onClick={startNew}>
        + سلایدی نوێ
      </button>

      {showForm ? (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <select
            value={editing.kind ?? "offer"}
            onChange={(e) =>
              setEditing((s) => ({ ...s, kind: e.target.value as PromoSlideKind }))
            }
          >
            <option value="offer">ئۆفەر</option>
            <option value="discount">داشکاندن</option>
            <option value="product">بەرهەم</option>
          </select>
          <input
            placeholder="ناونیشان (کوردی)"
            value={editing.titleCkb ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, titleCkb: e.target.value }))}
          />
          <input
            placeholder="العنوان عربي"
            value={editing.titleAr ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, titleAr: e.target.value }))}
          />
          <input
            placeholder="English title"
            value={editing.titleEn ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, titleEn: e.target.value }))}
          />
          <input
            type="number"
            placeholder="داشکاندن %"
            value={editing.discountPercent ?? ""}
            onChange={(e) =>
              setEditing((s) => ({
                ...s,
                discountPercent: Number(e.target.value) || undefined,
              }))
            }
          />
          <select
            value={editing.productId ?? ""}
            onChange={(e) =>
              setEditing((s) => ({
                ...s,
                productId: e.target.value || undefined,
              }))
            }
          >
            <option value="">— بەرهەم (ئارەزوومەند) —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameCkb}
              </option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadSlideImage(f);
            }}
          />
          {editing.imageUrl ? (
            <div className="relative h-20 rounded-lg">
              <Image src={editing.imageUrl} alt="" fill className="object-cover" />
            </div>
          ) : null}
          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1" disabled={pending} onClick={save}>
              پاشەکەوت
            </button>
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => setEditing({})}
            >
              هەڵوەشاندنەوە
            </button>
          </div>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {slides.map((s) => (
          <li key={s.id} className="flex items-center justify-between text-sm">
            <span>{s.titleCkb}</span>
            <div className="flex gap-2">
              <button type="button" className="text-bk-accent" onClick={() => setEditing(s)}>
                دەستکاری
              </button>
              <button
                type="button"
                className="text-red-300"
                onClick={() =>
                  start(async () => {
                    await deleteSlideAction(s.id);
                    reloadAdmin();
                  })
                }
              >
                سڕینەوە
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}