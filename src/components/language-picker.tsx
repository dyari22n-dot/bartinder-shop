"use client";

import { locales } from "@/lib/i18n";
import { useLocale } from "./locale-provider";

export function LanguagePicker() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex flex-col gap-1">
      <span className="text-end text-[10px] uppercase tracking-wider text-bk-muted">
        {t.language}
      </span>
      <div className="flex gap-1 rounded-2xl bg-white/5 p-1">
        {locales.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLocale(l.code)}
            className={`rounded-xl px-2 py-1 text-[11px] font-medium transition ${
              locale === l.code
                ? "bg-bk-accent/20 text-bk-accent"
                : "text-bk-muted hover:text-white"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}