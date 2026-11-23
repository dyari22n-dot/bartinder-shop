"use client";

import { useCallback, useEffect, useState } from "react";

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

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]["id"];

export function scrollToAdminSection(id: AdminSectionId) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AdminSectionNav() {
  const [active, setActive] = useState<AdminSectionId>("admin-categories");

  useEffect(() => {
    const elements = ADMIN_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) {
          setActive(hit.target.id as AdminSectionId);
        }
      },
      {
        root: null,
        rootMargin: "-72px 0px -50% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const jump = useCallback((id: AdminSectionId) => {
    scrollToAdminSection(id);
    setActive(id);
  }, []);

  const current = ADMIN_SECTIONS.find((s) => s.id === active) ?? ADMIN_SECTIONS[3];

  return (
    <nav
      className="sticky top-0 z-30 -mx-4 mb-4 border-b border-white/10 bg-bk-bg/95 px-4 py-2 backdrop-blur-md"
      aria-label="بەشەکانی پانێڵ"
    >
      <p className="mb-2 text-center text-[11px] text-bk-muted">
        ئێستا لەم بەشەدایت:{" "}
        <span className="font-bold text-bk-accent">
          {current.step !== "—" && current.step !== "…" ? `${current.step} · ` : ""}
          {current.label}
        </span>
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_SECTIONS.map((s) => {
          const on = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                on
                  ? "border-bk-accent bg-bk-accent text-bk-bg"
                  : "border-white/15 text-white/90"
              }`}
              aria-current={on ? "true" : undefined}
            >
              {s.step !== "—" && s.step !== "…" ? (
                <span className="me-1 opacity-80">{s.step}</span>
              ) : null}
              {s.label}
            </button>
          );
        })}
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
    <div id={id} className="scroll-mt-28">
      {children}
    </div>
  );
}