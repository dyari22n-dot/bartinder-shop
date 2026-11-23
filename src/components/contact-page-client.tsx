"use client";

import type { ContactLink } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { ContactLinks } from "./contact-links";
import { ContactIconRow } from "./contact-icon-row";

export function ContactPageClient({ contacts }: { contacts: ContactLink[] }) {
  const { locale, t } = useLocale();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <h1 className="text-lg font-bold text-white">{t.contact}</h1>
        <p className="mt-1 text-xs text-bk-muted">
          {locale === "ckb"
            ? "ژمارە یان لینک بەرتەپێکە — ڕاستەوخۆ دەردەچێتە تەلەفۆن/واتسئاپ/وێب"
            : locale === "ar"
              ? "اضغط على الرقم أو الرابط للاتصال مباشرة"
              : "Tap a number or link to call, message, or open the page"}
        </p>
      </div>
      {contacts.length === 0 ? (
        <p className="glass rounded-2xl p-4 text-sm text-bk-muted">
          {locale === "ckb"
            ? "پەیوەندیەکان لە پانێڵی بەڕێوەبەر زیاد بکە."
            : locale === "ar"
              ? "أضف جهات الاتصال من لوحة الإدارة."
              : "Add contacts from the admin panel."}
        </p>
      ) : (
        <div className="glass flex flex-col gap-4 rounded-3xl p-4">
          <ContactLinks links={contacts} />
          <div className="border-t border-white/10 pt-4">
            <ContactIconRow links={contacts} />
          </div>
        </div>
      )}
    </div>
  );
}