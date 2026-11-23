import { MobileShell } from "@/components/mobile-shell";
import { HomeClient } from "@/components/home-client";
import { getStore } from "@/lib/db";

export default async function HomePage() {
  const store = await getStore();
  const products = store.products.filter((p) => p.active);
  const slides = store.slides
    .filter((s) => s.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const contacts = (store.contacts ?? [])
    .filter((c) => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const brands = (store.brands ?? [])
    .filter((b) => b.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <MobileShell settings={store.settings ?? {}}>
      <HomeClient
        categories={store.categories}
        products={products}
        slides={slides}
        contacts={contacts}
        brands={brands}
        settings={store.settings ?? {}}
      />
    </MobileShell>
  );
}