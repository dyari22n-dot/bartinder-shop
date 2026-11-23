import type { ContactLink } from "./types";

export function contactOpenUrl(link: ContactLink): string | undefined {
  const href = link.href?.trim();
  if (href) {
    if (/^https?:\/\//i.test(href)) return href;
    if (href.startsWith("tel:") || href.startsWith("mailto:")) return href;
    return `https://${href}`;
  }
  const phone = link.phone?.replace(/\s/g, "");
  if (!phone) return undefined;
  return `tel:${phone}`;
}

export function contactSubtitle(link: ContactLink): string | undefined {
  if (link.phone?.trim()) return link.phone.trim();
  const href = link.href?.trim();
  if (!href) return undefined;
  try {
    if (href.startsWith("http")) return new URL(href).hostname;
  } catch {
    /* ignore */
  }
  return href;
}