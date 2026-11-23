"use client";

import type { Category } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { CategoryNavLink } from "./category-nav-link";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const { locale, t } = useLocale();
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-3 pb-4">
      <h1 className="text-lg font-bold text-white">{t.categories}</h1>
      <nav className="glass rounded-3xl p-2">
        <ul className="category-menu-list flex flex-col">
          {sorted.map((cat) => (
            <li key={cat.id}>
              <CategoryNavLink cat={cat} locale={locale} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}