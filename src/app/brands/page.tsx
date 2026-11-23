import { MobileShell } from "@/components/mobile-shell";
import { BrandsClient } from "@/components/brands-client";
import { getActiveBrands, getStore } from "@/lib/db";

export default async function BrandsPage() {
  const store = await getStore();
  const brands = await getActiveBrands();

  return (
    <MobileShell>
      <BrandsClient brands={brands} categories={store.categories} />
    </MobileShell>
  );
}