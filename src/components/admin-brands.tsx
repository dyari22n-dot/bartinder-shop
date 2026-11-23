"use client";

import Image from "next/image";
import { reloadAdmin } from "@/lib/admin-mutate";
import { useRef, useState, useTransition } from "react";
import type { Brand, Category } from "@/lib/types";
import {
  deleteBrandAction,
  saveBrandAction,
  uploadProductImageAction,
} from "@/lib/actions";

export function AdminBrands({
  brands,
  categories,
}: {
  brands: Brand[];
  categories: Category[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Partial<Brand> & { isNew?: boolean }>(
    {},
  );

  const sorted = [...brands].sort((a, b) => a.sortOrder - b.sortOrder);
  const showForm = Boolean(editing.isNew || editing.id);
  const selectedCats = new Set(editing.categoryIds ?? []);

  const startNew = () =>
    setEditing({
      isNew: true,
      nameCkb: "",
      nameAr: "",
      nameEn: "",
      categoryIds: ["coffee-beans"],
      active: true,
      sortOrder: sorted.length + 1,
    });

  const toggleCategory = (id: string) => {
    const next = new Set(editing.categoryIds ?? []);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setEditing((s) => ({ ...s, categoryIds: [...next] }));
  };

  const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    const res = await uploadProductImageAction(formData);
    if (res.ok && res.url) setEditing((s) => ({ ...s, logoUrl: res.url }));
  };

  const save = () =>
    start(async () => {
      setError(null);
      const res = await saveBrandAction({
        nameCkb: editing.nameCkb ?? "",
        nameAr: editing.nameAr ?? "",
        nameEn: editing.nameEn ?? "",
        logoUrl: editing.logoUrl,
        categoryIds: editing.categoryIds ?? [],
        active: editing.active ?? true,
        sortOrder: Number(editing.sortOrder) || sorted.length + 1,
        id: editing.isNew ? undefined : editing.id,
        slug: editing.slug,
      });
      if (!res.ok) {
        setError(res.error ?? "هەڵە");
        return;
      }
      setEditing({});
      reloadAdmin();
    });

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <h2 className="mb-2 text-sm font-bold text-bk-accent">براندەکان</h2>
      <p className="mb-3 text-xs text-bk-muted">
        فلتەر بۆ قاوە و بەشەکان — کڕیار لە /brands دەبینێت.
      </p>
      {error ? <p className="mb-2 text-xs text-red-300">{error}</p> : null}
      <button type="button" className="btn-outline mb-3 w-full" onClick={startNew}>
        + براندی نوێ
      </button>

      {showForm ? (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <input
            placeholder="ناو (کوردی) *"
            value={editing.nameCkb ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, nameCkb: e.target.value }))
            }
          />
          <input
            placeholder="عربي"
            value={editing.nameAr ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, nameAr: e.target.value }))
            }
          />
          <input
            placeholder="English"
            value={editing.nameEn ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, nameEn: e.target.value }))
            }
          />
          <input
            placeholder="slug (ئارەزوومەندانە)"
            value={editing.slug ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, slug: e.target.value }))}
          />
          <span className="text-xs text-bk-muted">بەشەکان (فلتەر)</span>
          <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`rounded-xl px-2 py-1 text-xs ${
                  selectedCats.has(c.id)
                    ? "bg-bk-accent text-bk-bg"
                    : "bg-white/10 text-white"
                }`}
                onClick={() => toggleCategory(c.id)}
              >
                {c.nameCkb}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadLogo(file);
            }}
          />
          {editing.logoUrl ? (
            <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-xl">
              <Image src={editing.logoUrl} alt="" fill className="object-contain" />
            </div>
          ) : null}
          <input
            type="number"
            placeholder="ڕیز"
            value={editing.sortOrder ?? 0}
            onChange={(e) =>
              setEditing((s) => ({ ...s, sortOrder: Number(e.target.value) }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.active ?? true}
              onChange={(e) =>
                setEditing((s) => ({ ...s, active: e.target.checked }))
              }
            />
            چالاک
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1"
              disabled={pending}
              onClick={save}
            >
              پاشەکەوت
            </button>
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => setEditing({})}
            >
              پاشگەزبوونەوە
            </button>
          </div>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {sorted.map((b) => (
          <li
            key={b.id}
            className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 p-3 text-sm"
          >
            {b.logoUrl ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                <Image
                  src={b.logoUrl}
                  alt=""
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{b.nameCkb}</p>
              <p className="text-xs text-bk-muted">
                {b.categoryIds.length} بەش · /brand/{b.slug}
              </p>
            </div>
            <button
              type="button"
              className="text-bk-accent"
              onClick={() => setEditing({ ...b })}
            >
              دەستکاری
            </button>
            <button
              type="button"
              className="text-red-300"
              onClick={() =>
                start(async () => {
                  await deleteBrandAction(b.id);
                  reloadAdmin();
                })
              }
            >
              سڕینەوە
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}