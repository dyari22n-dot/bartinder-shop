import { MobileShell } from "@/components/mobile-shell";
import { SearchPage } from "@/components/search-page";
import { getActiveBrands, getActiveProducts } from "@/lib/db";

export default async function SearchRoute() {
  const products = await getActiveProducts();
  const brands = await getActiveBrands();
  return (
    <MobileShell title="Search">
      <SearchPage catalog={products} brands={brands} />
    </MobileShell>
  );
}