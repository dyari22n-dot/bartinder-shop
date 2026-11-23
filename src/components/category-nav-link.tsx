import Link from "next/link";
import { ChevronLeft, Clapperboard } from "lucide-react";
import type { Category, Locale } from "@/lib/types";
import { pickLocale } from "@/lib/i18n";

export function CategoryNavLink({
  cat,
  locale,
  onNavigate,
}: {
  cat: Category;
  locale: Locale;
  onNavigate?: () => void;
}) {
  const hasMotion = Boolean(cat.motionMediaUrl);
  const name = pickLocale(locale, cat);

  return (
    <Link
      href={`/category/${cat.slug}`}
      onClick={onNavigate}
      className="category-nav-link flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-medium text-white transition hover:bg-bk-accent/10"
    >
      <span className="category-section__index category-section__index--sm shrink-0">
        {String(cat.sortOrder).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {hasMotion ? (
        <Clapperboard
          className="h-3.5 w-3.5 shrink-0 text-bk-accent/80"
          aria-hidden
        />
      ) : null}
      <ChevronLeft className="h-4 w-4 shrink-0 text-bk-muted ltr:rotate-180" />
    </Link>
  );
}