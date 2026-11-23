import { notFound } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { BrandProducts } from "@/components/brand-products";
import { getActiveProducts, getStore } from "@/lib/db";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const brand = (store.brands ?? []).find(
    (b) => b.slug === slug || b.id === slug,
  );
  if (!brand || !brand.active) notFound();

  const products = (await getActiveProducts()).filter(
    (p) => p.brandId === brand.id,
  );

  return (
    <MobileShell>
      <BrandProducts brand={brand} products={products} />
    </MobileShell>
  );
}