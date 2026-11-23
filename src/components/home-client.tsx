"use client";

import Link from "next/link";
import type {
  Brand,
  Category,
  ContactLink,
  Product,
  StoreSettings,
} from "@/lib/types";
import { useLocale } from "./locale-provider";
import { ProductCard } from "./product-card";
import { HomeHeroBanner } from "./home-hero-banner";
import { HomePromoCarousel } from "./home-promo-carousel";
import { HomeCategorySections } from "./home-category-sections";
import type { PromoSlide } from "@/lib/types";
import { HomeContactSection } from "./home-contact-section";
import { HomeBrandsSection } from "./home-brands-section";
import { ShopperHints } from "./shopper-hints";
import { AppShareLink } from "./app-share-link";
import { InstallAppBanner } from "./install-app-banner";

export function HomeClient({
  categories,
  products,
  settings,
  slides,
  contacts,
  brands,
}: {
  categories: Category[];
  products: Product[];
  contacts: ContactLink[];
  brands: Brand[];
  settings: StoreSettings;
  slides: PromoSlide[];
}) {
  const { locale, t } = useLocale();

  const featured = products.slice(0, 6);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <HomeHeroBanner settings={settings} />
      <HomePromoCarousel slides={slides} />

      <ShopperHints />

      <InstallAppBanner />

      <AppShareLink />

      <HomeBrandsSection brands={brands} />

      <HomeCategorySections categories={categories} products={products} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{t.bestSellers}</h2>
          <Link href="/categories" className="text-xs text-bk-accent" prefetch>
            {t.categories}
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-center text-sm text-bk-muted">
            {locale === "ckb"
              ? "بەم زووانە بەرهەم زیاد دەکرێت."
              : locale === "ar"
                ? "ستُضاف المنتجات قريباً."
                : "Products coming soon."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <HomeContactSection contacts={contacts} />
    </div>
  );
}