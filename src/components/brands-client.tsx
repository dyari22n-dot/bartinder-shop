"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Brand, Category } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { brandMatchesCategory } from "@/lib/brand-utils";
import { useLocale } from "./locale-provider";

export function BrandsClient({
  brands,
  categories,
}: {
  brands: Brand[];
  categories: Category[];
}) {
  const { locale, t } = useLocale();
  const [categoryId, setCategoryId] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    if (categoryId === "all") return brands;
    return brands.filter((b) => brandMatchesCategory(b, categoryId));
  }, [brands, categoryId]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="text-lg font-bold text-white">{t.brands}</h1>
      <p className="text-xs text-bk-muted">
        {locale === "ckb"
          ? "فلتەر بەپێی بەش — براندی قاوە و ئامێر"
          : locale === "ar"
            ? "تصفية حسب القسم"
            : "Filter by department"}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoryId("all")}
          className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-medium ${
            categoryId === "all"
              ? "bg-bk-accent text-bk-bg"
              : "bg-white/10 text-white"
          }`}
        >
          {locale === "ckb" ? "هەموو" : locale === "ar" ? "الكل" : "All"}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryId(cat.id)}
            className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-medium ${
              categoryId === cat.id
                ? "bg-bk-accent text-bk-bg"
                : "bg-white/10 text-white"
            }`}
          >
            {pickLocale(locale, cat)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-bk-muted">—</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {filtered.map((b) => {
            const name = pickLocale(locale, b);
            return (
              <li key={b.id}>
                <Link
                  href={`/brand/${b.slug}`}
                  className="glass flex flex-col items-center gap-2 rounded-3xl p-4 text-center transition hover:bg-bk-accent/10"
                >
                  {b.logoUrl ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white/5">
                      <Image
                        src={b.logoUrl}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bk-accent/15 text-lg font-bold text-bk-accent">
                      {name.charAt(0)}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-white">{name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}