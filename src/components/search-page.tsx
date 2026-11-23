"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Brand, Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { ProductCard } from "./product-card";

export function SearchPage({
  catalog,
  brands,
}: {
  catalog: Product[];
  brands: Brand[];
}) {
  const { locale, t } = useLocale();
  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState<string | "all">("all");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = catalog;
    if (brandId !== "all") {
      list = list.filter((p) => p.brandId === brandId);
    }
    if (!needle) return list.slice(0, 24);
    return list.filter((p) => {
      const name = pickLocale(locale, p).toLowerCase();
      return name.includes(needle);
    });
  }, [catalog, locale, q, brandId]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-white">{t.search}</h1>
        <Link href="/brands" className="text-xs text-bk-accent">
          {t.brands}
        </Link>
      </div>
      <input
        type="search"
        placeholder={t.search}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {brands.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setBrandId("all")}
            className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-medium ${
              brandId === "all"
                ? "bg-bk-accent text-bk-bg"
                : "bg-white/10 text-white"
            }`}
          >
            {locale === "ckb" ? "هەموو براند" : locale === "ar" ? "كل العلامات" : "All brands"}
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrandId(b.id)}
              className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-medium ${
                brandId === b.id
                  ? "bg-bk-accent text-bk-bg"
                  : "bg-white/10 text-white"
              }`}
            >
              {pickLocale(locale, b)}
            </button>
          ))}
        </div>
      ) : null}
      {results.length === 0 ? (
        <p className="text-sm text-bk-muted">—</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}