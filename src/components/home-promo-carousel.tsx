"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PromoSlide } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { brand } from "@/lib/brand";

const kindLabel = {
  ckb: { product: "بەرهەم", offer: "ئۆفەر", discount: "داشکاندن" },
  ar: { product: "منتج", offer: "عرض", discount: "خصم" },
  en: { product: "Product", offer: "Offer", discount: "Discount" },
};

function slideHref(slide: PromoSlide): string {
  if (slide.productId) return `/product/${slide.productId}`;
  if (slide.href) return slide.href;
  return "/categories";
}

function slideTitle(locale: "ckb" | "ar" | "en", slide: PromoSlide) {
  return pickLocale(locale, {
    nameCkb: slide.titleCkb,
    nameAr: slide.titleAr,
    nameEn: slide.titleEn,
  });
}

export function HomePromoCarousel({ slides }: { slides: PromoSlide[] }) {
  const { locale } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

  if (slides.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-bk-muted">
        {locale === "ckb"
          ? "ئۆفەر و داشکاندن"
          : locale === "ar"
            ? "عروض وخصومات"
            : "Offers & deals"}
      </h2>
      <div
        ref={trackRef}
        className="promo-carousel -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => {
          const title = slideTitle(locale, slide);
          const subtitle =
            locale === "ckb"
              ? slide.subtitleCkb
              : locale === "ar"
                ? slide.subtitleAr
                : slide.subtitleEn;
          const badge = kindLabel[locale][slide.kind];

          return (
            <Link
              key={slide.id}
              href={slideHref(slide)}
              className="promo-slide glass relative w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[16/9] w-full bg-bk-deep">
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="380px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-bk-accent/20 to-bk-deep">
                    <Image
                      src={brand.logo}
                      alt=""
                      width={64}
                      height={64}
                      className="opacity-70"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute start-3 top-3 rounded-full bg-bk-accent px-2.5 py-1 text-[10px] font-bold text-bk-bg">
                  {badge}
                  {slide.kind === "discount" && slide.discountPercent
                    ? ` −${slide.discountPercent}%`
                    : null}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-base font-bold text-white">{title}</p>
                  {subtitle ? (
                    <p className="mt-0.5 text-xs text-bk-cream/90">{subtitle}</p>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {slides.length > 1 ? (
        <div className="flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-bk-accent" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}