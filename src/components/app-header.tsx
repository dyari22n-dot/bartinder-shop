"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { brand } from "@/lib/brand";
import { BrandLogo } from "./brand-logo";
import { LanguagePicker } from "./language-picker";
import { useCategoryMenu } from "./category-menu-context";
import { useLocale } from "./locale-provider";

export function AppHeader({ title }: { title?: string }) {
  const { openMenu } = useCategoryMenu();
  const { t } = useLocale();

  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-2 px-4 pb-3 pt-5">
      <button
        type="button"
        onClick={openMenu}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-bk-accent/15"
        aria-label={t.categoryMenu}
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
        <BrandLogo size={40} priority />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">
            {brand.name}
          </p>
          {title ? (
            <p className="truncate text-xs text-bk-muted">{title}</p>
          ) : null}
        </div>
      </Link>
      <LanguagePicker />
    </header>
  );
}