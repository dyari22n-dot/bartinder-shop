"use client";

import { useState } from "react";

export function AdminHealth() {
  const [line, setLine] = useState<string | null>(null);

  const run = () => {
    setLine("…");
    void fetch("/api/admin/health", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then(
        (d: {
          ok?: boolean;
          readOk?: boolean;
          writeOk?: boolean;
          firestoreConfigured?: boolean;
          credentialLoadable?: boolean;
          counts?: { categories: number; products: number; brands: number };
          error?: string | null;
          hint?: string | null;
        }) => {
          const w = d.writeOk ? "نووسین ✓" : "نووسین ✗";
          const r = d.readOk ? "خوێندن ✓" : "خوێندن ✗";
          const c = d.counts
            ? `${d.counts.categories} بەش · ${d.counts.products} بەرهەم · ${d.counts.brands} براند`
            : "";
          if (!d.ok) {
            setLine(
              `${r} · ${w} · ${c} — ${d.error ?? "کێشە"}${d.hint ? ` · ${d.hint}` : ""}`,
            );
            return;
          }
          if (!d.writeOk && d.hint) {
            setLine(`${r} · ${w} · ${c} — ${d.hint}`);
            return;
          }
          setLine(`${r} · ${w} · ${c}`);
        },
      )
      .catch(() => setLine("پەیوەندی سێرڤەر"));
  };

  return (
    <p className="mb-3 text-[10px] text-bk-muted">
      <button type="button" className="text-bk-accent underline" onClick={run}>
        پشکنینی Firestore (هەموو بەشەکان)
      </button>
      {line ? <span className="mt-1 block text-white">{line}</span> : null}
    </p>
  );
}