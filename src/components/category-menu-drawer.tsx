"use client";

import { X } from "lucide-react";
import type { Category } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { CategoryNavLink } from "./category-nav-link";

export function CategoryMenuDrawer({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  const { locale, t } = useLocale();
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-md">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <aside
        className="absolute bottom-0 top-0 flex w-[min(100%,20rem)] flex-col border-s border-bk-border bg-bk-deep shadow-2xl end-0"
        role="dialog"
        aria-modal
        aria-label={t.categories}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <h2 className="text-lg font-bold text-white">{t.categories}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul className="category-menu-list flex flex-col">
            {sorted.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-bk-muted">…</li>
            ) : (
              sorted.map((cat) => (
                <li key={cat.id}>
                  <CategoryNavLink
                    cat={cat}
                    locale={locale}
                    onNavigate={onClose}
                  />
                </li>
              ))
            )}
          </ul>
        </nav>
      </aside>
    </div>
  );
}