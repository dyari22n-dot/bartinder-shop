"use client";

import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { ProductCard } from "./product-card";
import { ScrollReveal } from "./scroll-reveal";
import { CategoryMotionStage } from "./category-motion-stage";
import {
  CategorySectionShell,
  CategorySectionTitle,
} from "./category-section-shell";

export function HomeCategorySections({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const { locale } = useLocale();
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="flex flex-col gap-4 pb-2">
      {sorted.map((cat) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id);
        const name = pickLocale(locale, cat);

        return (
          <ScrollReveal key={cat.id}>
            <CategorySectionShell>
            <CategoryMotionStage motionUrl={cat.motionMediaUrl} lite>
            <CategorySectionTitle sortOrder={cat.sortOrder}>{name}</CategorySectionTitle>
            {catProducts.length === 0 ? (
              <p className="text-xs text-bk-muted">
                {locale === "ckb"
                  ? "بەم زووانە زیاد دەکرێت"
                  : locale === "ar"
                    ? "سيُضاف قريباً"
                    : "Coming soon"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {catProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            <Link
              href={`/category/${cat.slug}`}
              prefetch
              className="text-xs font-medium text-bk-accent"
            >
              {locale === "ckb"
                ? "هەمووی ببینە →"
                : locale === "ar"
                  ? "عرض الكل →"
                  : "See all →"}
            </Link>
            </CategoryMotionStage>
            </CategorySectionShell>
          </ScrollReveal>
        );
      })}
    </section>
  );
}