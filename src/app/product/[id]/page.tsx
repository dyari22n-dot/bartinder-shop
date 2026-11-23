import { notFound } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { ProductDetail } from "@/components/product-detail";
import { getProductById } from "@/lib/db";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product || !product.active) notFound();

  return (
    <MobileShell>
      <ProductDetail product={product} />
    </MobileShell>
  );
}