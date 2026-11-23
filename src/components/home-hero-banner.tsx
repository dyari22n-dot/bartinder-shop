"use client";

import Image from "next/image";
import type { StoreSettings } from "@/lib/types";
import { brand } from "@/lib/brand";
import { useLocale } from "./locale-provider";
import { BrandLogo } from "./brand-logo";

export function HomeHeroBanner({ settings }: { settings: StoreSettings }) {
  const { locale } = useLocale();
  const caption =
    locale === "ckb"
      ? settings.heroCaptionCkb ?? brand.taglineCkb
      : locale === "ar"
        ? settings.heroCaptionAr ?? brand.taglineAr
        : settings.heroCaptionEn ?? brand.taglineEn;

  return (
    <div className="relative -mx-4 mb-2 aspect-[16/10] w-[calc(100%+2rem)] overflow-hidden rounded-b-3xl">
      {settings.heroImageUrl ? (
        <Image
          src={settings.heroImageUrl}
          alt={brand.name}
          fill
          priority
          className="object-cover"
          sizes="448px"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-cyan-900/80 via-bk-deep to-bk-bg"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bk-bg via-bk-bg/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-5 pt-16 text-center">
        <BrandLogo size={88} className="mb-2 drop-shadow-lg" priority />
        <h1 className="text-lg font-bold text-white drop-shadow-md">
          {brand.name}
        </h1>
        <p className="mt-1 max-w-[18rem] text-xs leading-relaxed text-white/85">
          {caption}
        </p>
      </div>
    </div>
  );
}