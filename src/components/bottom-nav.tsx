"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const cartCount = useCart((s) => s.count());
  const { openMenu } = useCategoryMenu();

  const labels = {
    home: t.home,
    categories: t.categories,
    search: t.search,
    cart: t.cart,
    contact: t.contactNav,
  };

  return (
    <nav className="glass glass--nav fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 rounded-t-3xl px-1 pb-5 pt-3 touch-manipulation">
      <ul className="flex items-center justify-between gap-0.5">
        {links.map(({ href, icon: Icon, key, menu }) => {
          const active =
            key === "categories"
              ? pathname.startsWith("/category") || pathname === "/categories"
              : pathname === href;
          const className = `relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] leading-tight sm:text-xs active:opacity-80 ${
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

          return (
            <li key={href}>
              <Link href={href} className={className} prefetch={key !== "cart"}>
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