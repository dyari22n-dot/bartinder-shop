import type { ContactLink } from "./types";

export type ContactIconKind =
  | "whatsapp"
  | "phone"
  | "instagram"
  | "telegram"
  | "link";

export function contactIconKind(link: ContactLink): ContactIconKind {
  const hay = `${link.href ?? ""} ${link.labelEn} ${link.labelCkb}`.toLowerCase();
  if (hay.includes("wa.me") || hay.includes("whatsapp") || hay.includes("واتس")) {
    return "whatsapp";
  }
  if (hay.includes("instagram") || hay.includes("ئینستا")) {
    return "instagram";
  }
  if (hay.includes("t.me") || hay.includes("telegram") || hay.includes("تیلی")) {
    return "telegram";
  }
  if (link.phone?.trim() && !link.href?.trim()) return "phone";
  if (link.href?.trim()) return "link";
  return "phone";
}