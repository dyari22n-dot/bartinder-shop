import { brand } from "./brand";
import type { Locale, Product } from "./types";
import { pickLocale } from "./i18n";

export type CartLine = { product: Product; quantity: number };

export function buildWhatsAppUrl(
  lines: CartLine[],
  locale: Locale,
  customerNote?: string,
): string {
  const items = lines
    .map((line) => {
      const name = pickLocale(locale, line.product);
      return `• ${name} × ${line.quantity} — ${lineItemPriceText(line.product, line.quantity)}`;
    })
    .join("\n");
  const totals = cartTotals(lines);
  const text = [
    `🛒 ${brand.name}`,
    "",
    items,
    "",
    `${locale === "en" ? "Total" : locale === "ar" ? "المجموع" : "کۆ"}: ${formatCartTotals(totals)}`,
    customerNote ? `\n${customerNote}` : "",
  ].join("\n");
  return `https://wa.me/${brand.whatsappE164}?text=${encodeURIComponent(text)}`;
}

export function formatIqd(amount: number): string {
  return `${new Intl.NumberFormat("en-IQ").format(amount)} IQD`;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function lineItemPriceText(product: Product, qty: number): string {
  const parts: string[] = [];
  if (product.priceIqd > 0) {
    parts.push(formatIqd(product.priceIqd * qty));
  }
  if (product.priceUsd != null && product.priceUsd > 0) {
    parts.push(formatUsd(product.priceUsd * qty));
  }
  return parts.join(" · ") || "—";
}

export function cartTotals(lines: CartLine[]): { iqd: number; usd: number } {
  return lines.reduce(
    (acc, l) => ({
      iqd: acc.iqd + l.product.priceIqd * l.quantity,
      usd:
        acc.usd +
        (l.product.priceUsd != null && l.product.priceUsd > 0
          ? l.product.priceUsd * l.quantity
          : 0),
    }),
    { iqd: 0, usd: 0 },
  );
}

export function formatCartTotals(totals: { iqd: number; usd: number }): string {
  const parts: string[] = [];
  if (totals.iqd > 0) parts.push(formatIqd(totals.iqd));
  if (totals.usd > 0) parts.push(formatUsd(totals.usd));
  return parts.join(" · ") || formatIqd(0);
}