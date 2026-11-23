import { MobileShell } from "@/components/mobile-shell";
import { HomeClient } from "@/components/home-client";
import {
  getActiveBrands,
  getActiveContacts,
  getActiveProducts,
  getActiveSlides,
  getStore,
} from "@/lib/db";

export default async function HomePage() {
  const store = await getStore();
  const products = await getActiveProducts();
  const slides = await getActiveSlides();
  const contacts = await getActiveContacts();
  const brands = await getActiveBrands();

  return (
    <MobileShell>
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