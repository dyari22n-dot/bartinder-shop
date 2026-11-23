"use client";

import Image from "next/image";
import { BrandLogo } from "./brand-logo";
import type { Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { formatIqd } from "@/lib/whatsapp";
import { useLocale } from "./locale-provider";
import { useCart } from "@/store/cart";

function description(product: Product, locale: "ckb" | "ar" | "en") {
  if (locale === "ckb") return product.descriptionCkb;
  if (locale === "ar") return product.descriptionAr;
  return product.descriptionEn;
}

export function ProductDetail({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const add = useCart((s) => s.add);
  const name = pickLocale(locale, product);
  const desc = description(product, locale);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="glass relative aspect-square overflow-hidden rounded-3xl">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="448px"
            priority
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-bk-deep/50">
            <BrandLogo size={96} className="opacity-85" />
          </div>
        )}
      </div>
      <div>
        <h1 className="text-xl font-bold text-white">{name}</h1>
        <p className="mt-2 text-2xl font-bold text-bk-accent">
          {formatIqd(product.priceIqd)}
        </p>
        {desc ? (
          <p className="mt-3 text-sm leading-relaxed text-bk-muted">{desc}</p>
        ) : null}
      </div>
      <button type="button" className="btn-primary" onClick={() => add(product)}>
        {t.addToCart}
      </button>
    </div>
  );
}