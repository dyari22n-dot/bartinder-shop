"use client";

import Image from "next/image";
import type { Brand, Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { ProductCard } from "./product-card";
import { ScrollReveal } from "./scroll-reveal";

export function BrandProducts({
  brand,
  products,
}: {
  brand: Brand;
  products: Product[];
}) {
  const { locale } = useLocale();
  const name = pickLocale(locale, brand);

  return (
    <div className="pb-4">
      <div className="glass mb-4 flex flex-col items-center gap-3 rounded-3xl p-5 text-center">
        {brand.logoUrl ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/5">
            <Image
              src={brand.logoUrl}
              alt=""
              fill
              className="object-contain p-2"
              sizes="80px"
            />
          </div>
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-bk-accent/15 text-2xl font-bold text-bk-accent">
            {name.charAt(0)}
          </span>
        )}
        <h1 className="text-lg font-bold text-white">{name}</h1>
      </div>
      {products.length === 0 ? (
        <p className="glass rounded-2xl p-4 text-sm text-bk-muted">
          {locale === "ckb"
            ? "هێشتا بەرهەم بۆ ئەم براندە نییە — لە ئەدمین براند لەسەر بەرهەم دیاری بکە."
            : locale === "ar"
              ? "لا توجد منتجات لهذه العلامة بعد."
              : "No products for this brand yet."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => (
            <ScrollReveal key={p.id} delayMs={50 + i * 70}>
              <ProductCard product={p} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}