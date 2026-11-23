"use client";

import Link from "next/link";
import type { Brand } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";
import { useLocale } from "./locale-provider";

export function CategoryBrandChips({
  brands,
  categoryId,
}: {
  brands: Brand[];
  categoryId: string;
}) {
  const { locale, t } = useLocale();
  if (brands.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="mb-2 text-xs text-bk-muted">{t.brands}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/brand/${b.slug}?from=${categoryId}`}
            className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-bk-accent/40"
          >
            {pickLocale(locale, b)}
          </Link>
        ))}
        <Link
          href="/brands"
          className="shrink-0 rounded-2xl px-3 py-2 text-xs font-medium text-bk-accent"
        >
          →
        </Link>
      </div>
    </div>
  );
}