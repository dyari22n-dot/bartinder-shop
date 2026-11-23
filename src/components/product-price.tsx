import type { Product } from "@/lib/types";
import { formatIqd, formatUsd } from "@/lib/whatsapp";

export function ProductPrice({
  product,
  quantity = 1,
  className = "",
}: {
  product: Product;
  quantity?: number;
  className?: string;
}) {
  const showIqd = product.priceIqd > 0;
  const showUsd = product.priceUsd != null && product.priceUsd > 0;
  if (!showIqd && !showUsd) {
    return <span className={className}>—</span>;
  }
  return (
    <span className={className}>
      {showIqd ? formatIqd(product.priceIqd * quantity) : null}
      {showIqd && showUsd ? (
        <span className="font-normal text-bk-muted"> · </span>
      ) : null}
      {showUsd ? (
        <span className={showIqd ? "text-white/90" : undefined}>
          {formatUsd(product.priceUsd! * quantity)}
        </span>
      ) : null}
    </span>
  );
}