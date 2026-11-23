"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Category } from "@/lib/types";
import { loadStoreAction } from "@/lib/actions";
import { CategoryMenuDrawer } from "./category-menu-drawer";

type Ctx = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  categories: Category[];
};

const CategoryMenuContext = createContext<Ctx | null>(null);

export function CategoryMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  const ensureCategories = useCallback(async () => {
    if (loaded) return;
    const store = await loadStoreAction();
    setCategories(store.categories);
    setLoaded(true);
  }, [loaded]);

  const openMenu = useCallback(() => {
    void ensureCategories();
    setOpen(true);
  }, [ensureCategories]);

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