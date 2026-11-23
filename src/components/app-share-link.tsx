"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocale } from "./locale-provider";

export function AppShareLink() {
  const { locale } = useLocale();
  const url = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!url) return null;

  const isLocal = url.includes("localhost") || /^\d+\.\d+/.test(url);

  return (
    <section className="glass rounded-2xl border border-bk-accent/20 px-3 py-2.5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-bk-muted">
        {locale === "ckb"
          ? "لینکی ئاپ"
          : locale === "ar"
            ? "رابط التطبيق"
            : "App link"}
      </p>
      <div className="flex items-center gap-2">
        <a
          href={url}
          className="min-w-0 flex-1 truncate text-xs text-bk-accent underline"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-xl bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white"
        >
          {copied
            ? locale === "ckb"
              ? "کۆپی!"
              : "Copied"
            : locale === "ckb"
              ? "کۆپی"
              : "Copy"}
        </button>
      </div>
      {isLocal ? (
        <p className="mt-1.5 text-[10px] leading-snug text-bk-muted">
          {locale === "ckb"
            ? "لە مۆبایل لە هەمان Wi‑Fi: لینکی Network لە تێرمیناڵی dev بەکاربهێنە، یان deploy بکە بۆ لینکی گشتی."
            : "On mobile (same Wi‑Fi), use the Network URL from dev, or deploy for a public link."}
        </p>
      ) : null}
    </section>
  );
}