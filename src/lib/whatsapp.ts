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
      return `• ${name} × ${line.quantity} — ${formatIqd(line.product.priceIqd * line.quantity)}`;
    })
    .join("\n");
  const total = lines.reduce(
    (sum, l) => sum + l.product.priceIqd * l.quantity,
    0,
  );
  const text = [
    `🛒 ${brand.name}`,
    "",
    items,
    "",
    `${locale === "en" ? "Total" : locale === "ar" ? "المجموع" : "کۆ"}: ${formatIqd(total)}`,
    customerNote ? `\n${customerNote}` : "",
  ].join("\n");
  return `https://wa.me/${brand.whatsappE164}?text=${encodeURIComponent(text)}`;
}

export function formatIqd(amount: number): string {
  return `${new Intl.NumberFormat("en-IQ").format(amount)} IQD`;
}