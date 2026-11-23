"use client";

import type { Brand, Category, Product } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { ProductCard } from "./product-card";
import { ScrollReveal } from "./scroll-reveal";
import { CategoryMotionStage } from "./category-motion-stage";
import {
  CategorySectionShell,
  CategorySectionTitle,
} from "./category-section-shell";
import { CategoryBrandChips } from "./category-brand-chips";

export function CategoryProducts({
  category,
  products,
  brands = [],
}: {
  category: Category;
  products: Product[];
  brands?: Brand[];
}) {
  const { locale } = useLocale();
  const name = pickLocale(locale, category);

  return (
    <div className="pb-4">
      <CategorySectionShell>
      <CategoryMotionStage motionUrl={category.motionMediaUrl}>
        <ScrollReveal>
          <CategorySectionTitle sortOrder={category.sortOrder} heading="h1">
            {name}
          </CategorySectionTitle>
        </ScrollReveal>
        <CategoryBrandChips brands={brands} categoryId={category.id} />
        {products.length === 0 ? (
          <ScrollReveal>
            <p className="glass rounded-2xl p-4 text-sm text-bk-muted">
              {locale === "ckb"
                ? "هێشتا بەرهەم نییە بۆ ئەم بەشە."
                : locale === "ar"
                  ? "لا توجد منتجات في هذا القسم بعد."
                  : "No products in this category yet."}
            </p>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p, i) => (
              <ScrollReveal key={p.id} delayMs={60 + i * 85}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </CategoryMotionStage>
      </CategorySectionShell>
    </div>
  );
}