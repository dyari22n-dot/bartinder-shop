"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Menu } from "lucide-react";
import { brand } from "@/lib/brand";
import { BrandLogo } from "./brand-logo";
import { LanguagePicker } from "./language-picker";
import { useCategoryMenu } from "./category-menu-context";
import { useLocale } from "./locale-provider";

const ADMIN_HOLD_MS = 850;

export function AppHeader({ title }: { title?: string }) {
  const { openMenu } = useCategoryMenu();
  const { t } = useLocale();
  const router = useRouter();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipHomeNav = useRef(false);

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const startAdminHold = () => {
    clearHold();
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      skipHomeNav.current = true;
      router.push("/admin");
    }, ADMIN_HOLD_MS);
  };

  return (
    <header className="glass glass--header sticky top-0 z-30 flex touch-manipulation items-center gap-2 px-4 pb-3 pt-5">
      <button
        type="button"
        onClick={openMenu}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-bk-accent/15"
        aria-label={t.categoryMenu}
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link
        href="/"
        className="flex min-w-0 flex-1 items-center gap-2"
        onClick={(e) => {
          if (skipHomeNav.current) {
            e.preventDefault();
            skipHomeNav.current = false;
          }
        }}
        onPointerDown={startAdminHold}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
      >
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