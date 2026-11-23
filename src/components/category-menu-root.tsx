import type { ReactNode } from "react";
import { getStore } from "@/lib/db";
import { CategoryMenuProvider } from "./category-menu-context";

/** بەشەکان لە سێrڤەر — مێنوی مۆبایل بێ چاوەڕوانی Firestore */
export async function CategoryMenuRoot({ children }: { children: ReactNode }) {
  const { categories } = await getStore();
  return (
    <CategoryMenuProvider initialCategories={categories}>
      {children}
    </CategoryMenuProvider>
  );
}