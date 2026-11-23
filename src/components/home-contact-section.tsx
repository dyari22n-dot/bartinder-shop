"use client";

import Link from "next/link";
import type { ContactLink } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { ContactIconRow } from "./contact-icon-row";
import { ScrollReveal } from "./scroll-reveal";

export function HomeContactSection({
  contacts,
}: {
  contacts: ContactLink[];
}) {
  const { locale, t } = useLocale();

  if (contacts.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="glass flex flex-col rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-white">{t.contact}</h2>
          <Link href="/contact" className="text-xs font-medium text-bk-accent">
            {locale === "ckb"
              ? "وردەکاری →"
              : locale === "ar"
                ? "تفاصيل →"
                : "Details →"}
          </Link>
        </div>
        <p className="mb-4 flex-1 text-xs text-bk-muted">
          {locale === "ckb"
            ? "ئایکۆنەکان — کلیک بکە بۆ پەیوەندی"
            : locale === "ar"
              ? "اضغط على الأيقونة للتواصل"
              : "Tap an icon to reach us"}
        </p>
        <div className="contact-section-icons border-t border-white/10 pt-4">
          <ContactIconRow links={contacts} />
        </div>
      </section>
    </ScrollReveal>
  );
}