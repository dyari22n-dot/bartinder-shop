"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { Home, LayoutGrid, Phone, ShoppingBag, Search } from "lucide-react";
import { useLocale } from "./locale-provider";
import { useCart } from "@/store/cart";
import { useCategoryMenu } from "./category-menu-context";

const links = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/categories", icon: LayoutGrid, key: "categories" as const, menu: true },
  { href: "/search", icon: Search, key: "search" as const },
  { href: "/contact", icon: Phone, key: "contact" as const },
  { href: "/cart", icon: ShoppingBag, key: "cart" as const },
];

const ADMIN_HOLD_MS = 850;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const cartCount = useCart((s) => s.count());
  const { openMenu } = useCategoryMenu();
  const adminHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextHomeNav = useRef(false);

  const clearAdminHold = () => {
    if (adminHoldTimer.current) {
      clearTimeout(adminHoldTimer.current);
      adminHoldTimer.current = null;
    }
  };

  const startAdminHold = () => {
    clearAdminHold();
    adminHoldTimer.current = setTimeout(() => {
      adminHoldTimer.current = null;
      skipNextHomeNav.current = true;
      router.push("/admin");
    }, ADMIN_HOLD_MS);
  };

  const onHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (skipNextHomeNav.current) {
      e.preventDefault();
      skipNextHomeNav.current = false;
    }
  };

  const labels = {
    home: t.home,
    categories: t.categories,
    search: t.search,
    cart: t.cart,
    contact: t.contactNav,
  };

  return (
    <nav className="glass fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 rounded-t-3xl px-1 pb-5 pt-3">
      <ul className="flex items-center justify-between gap-0.5">
        {links.map(({ href, icon: Icon, key, menu }) => {
          const active =
            key === "categories"
              ? pathname.startsWith("/category") || pathname === "/categories"
              : pathname === href;
          const className = `relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] leading-tight transition sm:text-xs ${
            active ? "text-bk-accent" : "text-bk-muted hover:text-white"
          }`;

          if (menu) {
            return (
              <li key={href}>
                <button
                  type="button"
                  onClick={openMenu}
                  className={className}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  <span className="max-w-[4.5rem] truncate text-center">
                    {labels[key]}
                  </span>
                </button>
              </li>
            );
          }

          const isHome = key === "home";

          return (
            <li key={href}>
              <Link
                href={href}
                className={className}
                onClick={isHome ? onHomeClick : undefined}
                onPointerDown={isHome ? startAdminHold : undefined}
                onPointerUp={isHome ? clearAdminHold : undefined}
                onPointerLeave={isHome ? clearAdminHold : undefined}
                onPointerCancel={isHome ? clearAdminHold : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="max-w-[4.5rem] truncate text-center">
                  {labels[key]}
                </span>
                {key === "cart" && cartCount > 0 ? (
                  <span className="absolute -end-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-bk-accent px-1 text-[10px] font-bold text-bk-bg">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}