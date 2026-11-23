/** ژمارەکانی عەرەبی/فارسی → ٠-٩ */
export function normalizeWesternDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0))
    .replace(/[٫،]/g, ".");
}

export function parsePriceIqdText(raw: string): number {
  const normalized = normalizeWesternDigits(raw);
  const digits = normalized.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function parsePriceUsdText(raw: string): number {
  const normalized = normalizeWesternDigits(raw);
  const cleaned = normalized.replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}