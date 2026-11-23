"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { Brand, Category, Product } from "@/lib/types";
import { reloadAdmin } from "@/lib/admin-mutate";
import { parsePriceIqdText, parsePriceUsdText } from "@/lib/price-input";
import { formatIqd, formatUsd } from "@/lib/whatsapp";

async function apiProducts<T>(body: object): Promise<T> {
  const res = await fetch("/api/admin/products", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

export function AdminProducts({
  categories,
  products,
  brands,
}: {
  categories: Category[];
  products: Product[];
  brands: Brand[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyImage, setBusyImage] = useState(false);
  const [moreFields, setMoreFields] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [priceText, setPriceText] = useState("");
  const [usdText, setUsdText] = useState("");
  const [editing, setEditing] = useState<Partial<Product> & { isNew?: boolean }>(
    {},
  );

  const showForm = Boolean(editing.isNew || editing.id);

  const syncPriceText = (iqd: number | undefined) => {
    setPriceText(iqd && iqd > 0 ? String(iqd) : "");
  };

  const syncUsdText = (usd: number | undefined) => {
    setUsdText(usd != null && usd > 0 ? String(usd) : "");
  };

  const startNew = (categoryId?: string) => {
    setPendingFile(null);
    setMoreFields(false);
    syncPriceText(0);
    syncUsdText(undefined);
    setEditing({
      isNew: true,
      categoryId: categoryId ?? categories[0]?.id ?? "",
      nameCkb: "",
      priceIqd: 0,
      imageUrl: "",
      active: true,
      descriptionCkb: "",
    });
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/products/image", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
    if (!data.ok) throw new Error(data.error ?? "وێنە");
    return data.url!;
  };

  const save = () =>
    start(async () => {
      setError(null);
      if (!editing.categoryId || !editing.nameCkb?.trim()) {
        setError("ناو + بەش پێویستە");
        return;
      }
      const priceIqd = parsePriceIqdText(priceText);
      const priceUsd = parsePriceUsdText(usdText);
      if (priceIqd <= 0 && priceUsd <= 0) {
        setError("نرخ بنووسە (ژمارەی ئینگلیزی 123 یان عەرەبی ١٢٣)");
        return;
      }
      setBusyImage(Boolean(pendingFile));
      try {
        let imageUrl = editing.imageUrl?.trim() || undefined;
        if (pendingFile) {
          imageUrl = await uploadImage(pendingFile);
        }
        const name = editing.nameCkb.trim();
        const nameAr = editing.nameAr?.trim();
        const nameEn = editing.nameEn?.trim();
        const desc = editing.descriptionCkb?.trim();
        const res = await apiProducts<{ ok?: boolean; error?: string }>({
          op: "save",
          product: {
            id: editing.isNew ? undefined : editing.id,
            categoryId: editing.categoryId,
            brandId: editing.brandId || undefined,
            nameCkb: name,
            nameAr: nameAr && nameAr !== name ? nameAr : undefined,
            nameEn: nameEn && nameEn !== name ? nameEn : undefined,
            descriptionCkb: desc || undefined,
            descriptionAr: editing.descriptionAr?.trim() || desc || undefined,
            descriptionEn: editing.descriptionEn?.trim() || desc || undefined,
            priceIqd,
            priceUsd: priceUsd > 0 ? priceUsd : undefined,
            imageUrl,
            active: editing.active ?? true,
          },
        });
        if (!res.ok) {
          setError(res.error ?? "هەڵە");
          return;
        }
        setEditing({});
        setPendingFile(null);
        setPriceText("");
        setUsdText("");
        reloadAdmin();
      } catch (e) {
        setError(e instanceof Error ? e.message : "هەڵە");
      } finally {
        setBusyImage(false);
      }
    });

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <p className="mb-0.5 text-[10px] font-semibold text-bk-accent">هەنگاو ٣</p>
      <h2 className="mb-1 text-sm font-bold text-bk-accent">بەرهەم — خێرا</h2>
      <p className="mb-3 text-xs text-bk-muted">
        تەنها ناوی کوردی بنووسە — عەرەبی/ئینگلیزی خۆکار وەک هەمان ناو دەبێت
      </p>

      {categories.length === 0 ? (
        <p className="mb-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          پێش بەرهەم، لە <strong>هەنگاو ١ · بەشەکان</strong> لانیکەم یەک بەش زیاد
          بکە — دووبارە بگەڕێرەوە بۆ ئێرە.
        </p>
      ) : null}

      {categories.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white"
              onClick={() => startNew(c.id)}
            >
              + {c.nameCkb}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="btn-outline mb-3 w-full text-xs"
        onClick={() => startNew()}
      >
        + بەرهەمی نوێ
      </button>

      {error ? <p className="mb-2 text-xs text-red-300">{error}</p> : null}

      {showForm ? (
        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <select
            value={editing.categoryId ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, categoryId: e.target.value }))
            }
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameCkb}
              </option>
            ))}
          </select>
          <div className="rounded-lg border border-bk-accent/40 bg-bk-accent/10 p-2">
            <label className="mb-1 block text-xs font-bold text-bk-accent">
              نرخ IQD (دینار) *
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="15000 یان ١٥٠٠٠"
              className="text-base font-semibold"
              value={priceText}
              onChange={(e) => {
                setPriceText(e.target.value);
                setEditing((s) => ({
                  ...s,
                  priceIqd: parsePriceIqdText(e.target.value),
                }));
              }}
            />
            {priceText ? (
              <p className="mt-1 text-sm font-semibold text-bk-accent">
                {formatIqd(parsePriceIqdText(priceText))}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-bk-muted">
                لانیکەم یەکێک: IQD یان $
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-white/90">
              نرخ $ (دۆلار)
            </label>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="12 یان 12.5"
              value={usdText}
              onChange={(e) => {
                setUsdText(e.target.value);
                setEditing((s) => ({
                  ...s,
                  priceUsd: parsePriceUsdText(e.target.value) || undefined,
                }));
              }}
            />
            {usdText ? (
              <p className="mt-1 text-sm font-semibold text-white/90">
                {formatUsd(parsePriceUsdText(usdText))}
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-white">ناو (کوردی) *</label>
            <input
              placeholder="تەنها لێرە بنووسە"
              value={editing.nameCkb ?? ""}
              onChange={(e) => setEditing((s) => ({ ...s, nameCkb: e.target.value }))}
            />
            <p className="mt-1 text-[10px] text-bk-muted">
              عەرەبی و ئینگلیزی پێویست نییە — لە فرۆشگا هەمان ناو دەردەکەوێت
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-bk-muted">
              زانیاری بەرهەم (ئارەزوومەندانە)
            </label>
            <textarea
              rows={3}
              placeholder="قەبارە، تام، تێبینی… کڕیار لە وردەکاری بەرهەم دەبینێت"
              className="resize-y text-xs"
              value={editing.descriptionCkb ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, descriptionCkb: e.target.value }))
              }
            />
          </div>
          <input
            type="file"
            accept="image/*"
            className="text-xs"
            disabled={busyImage || pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPendingFile(f);
                setError(null);
              }
              e.target.value = "";
            }}
          />
          {pendingFile ? (
            <p className="text-[10px] text-bk-accent">وێنە هەڵبژێردرا — لەگەڵ پاشەکەوت دەچێت</p>
          ) : null}
          {editing.imageUrl ? (
            <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl">
              <Image
                src={editing.imageUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <button
            type="button"
            className="text-[11px] text-bk-muted underline"
            onClick={() => setMoreFields((v) => !v)}
          >
            {moreFields ? "کەمتر ▲" : "زیاتر (براند · لینک · ناوی جیاواز)
          </button>
          {moreFields ? (
            <>
              <p className="text-[10px] text-bk-muted">
                ناوی عەرەبی/ئینگلیزی — تەنها ئەگەر جیاواز بێت لە کوردی
              </p>
              <input
                placeholder="الاسم عربي (ئارەزوومەندانە)"
                value={editing.nameAr ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, nameAr: e.target.value }))
                }
              />
              <input
                placeholder="English (optional)"
                value={editing.nameEn ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, nameEn: e.target.value }))
                }
              />
              <select
                value={editing.brandId ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({
                    ...s,
                    brandId: e.target.value || undefined,
                  }))
                }
              >
                <option value="">— براند —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameCkb}
                  </option>
                ))}
              </select>
              <input
                placeholder="لینکی وێنە"
                value={editing.imageUrl ?? ""}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, imageUrl: e.target.value }))
                }
              />
            </>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1 text-xs"
              disabled={pending || busyImage}
              onClick={save}
            >
              پاشەکەوت
            </button>
            <button
              type="button"
              className="btn-outline flex-1 text-xs"
              onClick={() => {
                setEditing({});
                setPendingFile(null);
              }}
            >
              پاشگەز
            </button>
          </div>
        </div>
      ) : null}

      <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {products.length === 0 ? (
          <li className="text-center text-xs text-bk-muted">هێشتا بەرهەم نییە</li>
        ) : (
          products.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-2 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.nameCkb}</p>
                  <p className="font-semibold text-bk-accent">
                    {[
                      p.priceIqd > 0 ? formatIqd(p.priceIqd) : null,
                      p.priceUsd != null && p.priceUsd > 0
                        ? formatUsd(p.priceUsd)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "— نرخ نییە"}
                  </p>
                  <p className="text-bk-muted">
                    {cat ? cat.nameCkb : ""}
                    {p.descriptionCkb
                      ? ` · ${p.descriptionCkb.slice(0, 48)}${p.descriptionCkb.length > 48 ? "…" : ""}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="text-bk-accent"
                    onClick={() => {
                      setMoreFields(Boolean(p.descriptionAr || p.brandId));
                      syncPriceText(p.priceIqd);
                      syncUsdText(p.priceUsd);
                      setEditing({ ...p });
                    }}
                  >
                    دەستکاری
                  </button>
                  <button
                    type="button"
                    className="text-red-300"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await apiProducts<{ ok?: boolean }>({
                          op: "delete",
                          id: p.id,
                        });
                        if (res.ok) reloadAdmin();
                      })
                    }
                  >
                    سڕینەوە
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
      {pending || busyImage ? (
        <p className="mt-2 text-center text-xs text-bk-accent">…</p>
      ) : null}
    </section>
  );
}