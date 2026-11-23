import { MobileShell } from "@/components/mobile-shell";
import { CartPage } from "@/components/cart-page";
import { getActiveProducts } from "@/lib/db";

export default async function CartRoute() {
  const products = await getActiveProducts();
  return (
    <MobileShell title="Cart">
      <CartPage catalog={products} />
    </MobileShell>
  );
}