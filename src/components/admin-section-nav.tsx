"use client";

import type { MouseEvent } from "react";

const NAV_OFFSET_PX = 96;

export const ADMIN_SECTIONS = [
  { id: "admin-sellers", step: "—", label: "فرۆشیار" },
  { id: "admin-motion", step: "…", label: "پاشبنەوە" },
  { id: "admin-hero", step: "…", label: "هێرو" },
  { id: "admin-categories", step: "1", label: "بەشەکان" },
  { id: "admin-brands", step: "2", label: "براند" },
  { id: "admin-products", step: "3", label: "بەرهەم" },
  { id: "admin-contacts", step: "4", label: "پەیوەندی" },
  { id: "admin-slides", step: "5", label: "سلاید" },
] as const;

export const ADMIN_MAIN_SECTIONS = ADMIN_SECTIONS.filter(
  (s) => s.step === "1" || s.step === "2" || s.step === "3" || s.step === "4" || s.step === "5",
);

export const ADMIN_EXTRA_SECTIONS = ADMIN_SECTIONS.filter(
  (s) => s.step === "—" || s.step === "…",
);

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]["id"];

/** گەڕان — هەمان شێوازی کۆن (anchor) بە offset بۆ مێنیوی سەرەوە */
export function scrollToAdminSection(id: AdminSectionId) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  return true;
}

function jumpSection(e: MouseEvent<HTMLAnchorElement>, id: AdminSectionId) {
  e.preventDefault();
  scrollToAdminSection(id);
}

export function AdminSectionNav() {
  return (
    <nav
      id="admin-top-menu"
      className="sticky top-0 z-40 -mx-4 mb-4 border-b border-white/10 bg-bk-bg px-4 py-3"
      aria-label="مێنوی بەشەکانی پانێڵ"
    >
      <p className="mb-2 text-center text-[11px] text-bk-muted">
        مێنوی سەرەوە — کلیک بکە بۆ گەیشتن بە بەش
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {ADMIN_MAIN_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => jumpSection(e, s.id)}
            className="inline-flex min-h-10 min-w-[4.5rem] items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 text-[11px] font-semibold text-white active:bg-bk-accent active:text-bk-bg"
          >
            <span className="me-1 text-bk-accent">{s.step}</span>
            {s.label}
          </a>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-white/5 pt-2">
        {ADMIN_EXTRA_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => jumpSection(e, s.id)}
            className="inline-flex min-h-9 items-center rounded-full border border-white/10 px-2.5 text-[10px] text-bk-muted active:text-white"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function AdminSectionMarker({
  id,
  children,
}: {
  id: AdminSectionId;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[6.5rem]">
      {children}
    </section>
  );
}