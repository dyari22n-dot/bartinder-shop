import Link from "next/link";
import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";

export function CategoryChip({
  category,
  locale,
}: {
  category: Category;
  locale: Locale;
}) {
  const name = pickLocale(locale, category);
  return (
    <Link
      href={`/category/${category.slug}`}
      className="glass shrink-0 rounded-2xl px-4 py-3 text-sm font-medium text-white transition hover:border-bk-accent/40 hover:bg-bk-accent/10"
    >
      {name}
    </Link>
  );
}