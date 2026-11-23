"use client";

import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { brandMatchesCategory } from "@/lib/brand-utils";
import { useLocale } from "./locale-provider";
import { ScrollReveal } from "./scroll-reveal";

export function HomeBrandsSection({
  brands,
  categoryId = "coffee-beans",
}: {
  brands: Brand[];
  categoryId?: string;
}) {
  const { locale, t } = useLocale();
  const coffeeBrands = brands.filter((b) =>
    brandMatchesCategory(b, categoryId),
  );
  const preview = coffeeBrands.slice(0, 6);

  if (preview.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-white">{t.brands}</h2>
          <Link href="/brands" className="text-xs font-medium text-bk-accent">
            {locale === "ckb" ? "هەموو →" : locale === "ar" ? "الكل →" : "All →"}
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {preview.map((b) => {
            const name = pickLocale(locale, b);
            return (
              <Link
                key={b.id}
                href={`/brand/${b.slug}`}
                className="flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-2 transition hover:border-bk-accent/40"
              >
                {b.logoUrl ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                    <Image
                      src={b.logoUrl}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bk-accent/15 text-sm font-bold text-bk-accent">
                    {name.charAt(0)}
                  </span>
                )}
                <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-white">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}