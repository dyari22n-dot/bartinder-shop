import { MobileShell } from "@/components/mobile-shell";
import { CategoriesClient } from "@/components/categories-client";
import { getStore } from "@/lib/db";

export default async function CategoriesPage() {
  const store = await getStore();
  return (
    <MobileShell title="Categories">
      <CategoriesClient categories={store.categories} />
    </MobileShell>
  );
}