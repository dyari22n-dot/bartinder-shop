import { notFound } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { CategoryProducts } from "@/components/category-products";
import { getActiveBrands, getActiveProducts, getStore } from "@/lib/db";
import { brandMatchesCategory } from "@/lib/brand-utils";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const category = store.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = (await getActiveProducts()).filter(
    (p) => p.categoryId === category.id,
  );
  const brands = (await getActiveBrands()).filter((b) =>
    brandMatchesCategory(b, category.id),
  );

  return (
    <MobileShell>
      <CategoryProducts
        category={category}
        products={products}
        brands={brands}
      />
    </MobileShell>
  );
}