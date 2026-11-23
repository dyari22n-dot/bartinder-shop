import { MobileShell } from "@/components/mobile-shell";
import { CheckoutPage } from "@/components/checkout-page";
import { getActiveProducts } from "@/lib/db";

export default async function CheckoutRoute() {
  const products = await getActiveProducts();
  return (
    <MobileShell title="Checkout">
      <CheckoutPage catalog={products} />
    </MobileShell>
  );
}