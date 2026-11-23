"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

/** ڕێڕەوی ئاسان بۆ کڕیار — بێ گۆڕینی شێوازی ئێستا */
export function ShopperHints() {
  const { locale, t } = useLocale();

  const steps =
    locale === "ckb"
      ? [
          { label: "بەشەکان", href: "/categories" },
          { label: t.brands, href: "/brands" },
          { label: t.contactNav, href: "/contact" },
        ]
      : locale === "ar"
        ? [
            { label: t.categories, href: "/categories" },
            { label: t.brands, href: "/brands" },
            { label: t.contactNav, href: "/contact" },
          ]
        : [
            { label: t.categories, href: "/categories" },
            { label: t.brands, href: "/brands" },
            { label: t.contactNav, href: "/contact" },
          ];

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-bk-muted"
      aria-label={locale === "ckb" ? "ڕێنمایی کڕین" : "Shopping hints"}
    >
      <span className="text-bk-muted/90">
        {locale === "ckb"
          ? "کڕین:"
          : locale === "ar"
            ? "تسوق:"
            : "Shop:"}
      </span>
      {steps.map((s, i) => (
        <span key={s.href} className="inline-flex items-center gap-2">
          {i > 0 ? <span aria-hidden>·</span> : null}
          <Link href={s.href} className="font-medium text-bk-accent hover:underline">
            {s.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}