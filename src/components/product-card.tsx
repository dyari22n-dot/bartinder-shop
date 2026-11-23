"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { ProductPrice } from "./product-price";
import { useLocale } from "./locale-provider";
import { useCart } from "@/store/cart";

export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const add = useCart((s) => s.add);
  const name = pickLocale(locale, product);

  return (
    <article className="glass flex flex-col overflow-hidden rounded-3xl">
      <Link href={`/product/${product.id}`} className="relative block aspect-square">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 448px) 50vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-bk-accent/10 to-bk-deep/40">
            <BrandLogo size={72} className="opacity-80" />
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-white">{name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <ProductPrice
            product={product}
            className="text-sm font-bold text-bk-accent"
          />
          <button
            type="button"
            onClick={() => add(product)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-bk-accent text-bk-bg transition hover:bg-white"
            aria-label={t.addToCart}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}