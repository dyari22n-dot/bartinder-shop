import type { Brand, Product } from "./types";

export function brandMatchesCategory(
  brand: Brand,
  categoryId: string,
): boolean {
  if (!brand.categoryIds?.length) return true;
  return brand.categoryIds.includes(categoryId);
}

export function productsForBrand(
  products: Product[],
  brandId: string,
): Product[] {
  return products.filter((p) => p.active && p.brandId === brandId);
}