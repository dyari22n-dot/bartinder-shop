"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { formatIqd } from "@/lib/whatsapp";
import { useLocale } from "./locale-provider";
import { useCart } from "@/store/cart";
import { BrandLogo } from "./brand-logo";

export function CartPage({ catalog }: { catalog: Product[] }) {
  const { locale, t } = useLocale();
  const { items, setQuantity, remove, count } = useCart();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = catalog.find((p) => p.id === item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
  }, [items, catalog]);

  const total = lines.reduce(
    (sum, l) => sum + l.product.priceIqd * l.quantity,
    0,
  );

  if (!hydrated) {
    return <p className="text-sm text-bk-muted">…</p>;
  }

  if (count() === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <BrandLogo size={80} />
        <p className="text-bk-muted">{t.emptyCart}</p>
        <Link href="/categories" className="btn-primary w-full max-w-xs">
          {t.shopNow}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="text-lg font-bold text-white">{t.cart}</h1>
      <ul className="flex flex-col gap-3">
        {lines.map(({ product, quantity }) => (
          <li key={product.id} className="glass flex gap-3 rounded-2xl p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bk-deep">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              ) : (
                <BrandLogo size={56} className="p-1" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-sm font-semibold">
                {pickLocale(locale, product)}
              </p>
              <p className="text-xs text-bk-accent">
                {formatIqd(product.priceIqd)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg bg-white/10"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                >
                  −
                </button>
                <span className="text-sm">{quantity}</span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-lg bg-white/10"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="ms-auto text-xs text-red-300"
                  onClick={() => remove(product.id)}
                >
                  ×
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="glass rounded-2xl p-4">
        <div className="flex justify-between text-sm">
          <span className="text-bk-muted">{t.total}</span>
          <span className="font-bold text-bk-accent">{formatIqd(total)}</span>
        </div>
        <Link href="/checkout" className="btn-primary mt-4 block">
          {t.checkout}
        </Link>
      </div>
    </div>
  );
}