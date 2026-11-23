"use client";

import { AdminHealth } from "./admin-health";
import {
  ADMIN_SECTIONS,
  scrollToAdminSection,
  type AdminSectionId,
} from "./admin-section-nav";

const GUIDE_STEPS: { sectionId: AdminSectionId; text: string }[] = [
  { sectionId: "admin-categories", text: "ڕیزبەندی بەشەکان" },
  { sectionId: "admin-brands", text: "براندەکان" },
  { sectionId: "admin-products", text: "بەرهەم" },
  { sectionId: "admin-contacts", text: "پەیوەندیمان" },
  { sectionId: "admin-slides", text: "سلاید / هێرو" },
];

/** ڕیزبەندی کارەکانی فرۆشیار */
export function AdminStoreGuide() {
  return (
    <section className="glass mb-6 rounded-2xl border border-bk-accent/20 p-4">
      <h2 className="mb-2 text-sm font-bold text-bk-accent">ڕێنمایی فرۆشیار</h2>
      <p className="mb-2 text-[11px] text-bk-muted">
        ناوەکان: تەنها کوردی. دەستکاری → فۆڕمی سەرەوە دەکرێتەوە → پاشەکەوت.
        ئەگەر پاشەکەوت نەکرا، پەیامی سوور لە خوار فۆرمەکە دەخوێنرێتەوە.
      </p>
      <AdminHealth />
      <ol className="mt-2 list-inside list-decimal space-y-1.5 text-xs">
        {GUIDE_STEPS.map((item, i) => {
          const meta = ADMIN_SECTIONS.find((s) => s.id === item.sectionId);
          return (
            <li key={item.sectionId}>
              <a
                href={`#${item.sectionId}`}
                className="text-start text-white underline decoration-bk-accent/50 underline-offset-2"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToAdminSection(item.sectionId);
                }}
              >
                {meta?.step ? `${meta.step}. ` : `${i + 1}. `}
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}