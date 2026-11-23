"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "@/lib/types";
import { CategoryMenuDrawer } from "./category-menu-drawer";

type Ctx = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  categories: Category[];
};

const CategoryMenuContext = createContext<Ctx | null>(null);

export function CategoryMenuProvider({
  children,
  initialCategories = [],
}: {
  children: ReactNode;
  initialCategories?: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [categories] = useState<Category[]>(initialCategories);

  const openMenu = useCallback(() => setOpen(true), []);

  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <CategoryMenuContext.Provider
      value={{ open, openMenu, closeMenu, categories }}
    >
      {children}
      <CategoryMenuDrawer
        open={open}
        onClose={closeMenu}
        categories={categories}
      />
    </CategoryMenuContext.Provider>
  );
}

export function useCategoryMenu() {
  const ctx = useContext(CategoryMenuContext);
  if (!ctx) {
    throw new Error("useCategoryMenu must be used within CategoryMenuProvider");
  }
  return ctx;
}