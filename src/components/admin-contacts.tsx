"use client";

import { adminPostJson } from "@/lib/admin-api";
import { reloadAdmin } from "@/lib/admin-mutate";
import { withAdminTimeout } from "@/lib/admin-task";
import { useState } from "react";
import { ADMIN_KURDISH_ONLY_HINT } from "@/lib/locale-names";
import type { ContactLink } from "@/lib/types";
import { AdminKurdishNameFields } from "./admin-kurdish-name-fields";

type Props = { contacts: ContactLink[] };

export function AdminContacts({ contacts }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<
    Partial<ContactLink> & { isNew?: boolean }
  >({});
  const [moreNames, setMoreNames] = useState(false);

  const sorted = [...contacts].sort((a, b) => a.sortOrder - b.sortOrder);
  const showForm = Boolean(editing.isNew || editing.id);

  const startNew = () => {
    setMoreNames(false);
    setEditing({
      isNew: true,
      labelCkb: "",
      labelAr: "",
      labelEn: "",
      phone: "",
      href: "",
      active: true,
      sortOrder: sorted.length + 1,
    });
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await withAdminTimeout(
        adminPostJson<{ ok?: boolean; error?: string }>("/api/admin/contacts", {
          op: "save",
          contact: {
            labelCkb: editing.labelCkb ?? "",
            labelAr: editing.labelAr ?? "",
            labelEn: editing.labelEn ?? "",
            phone: editing.phone?.trim() || undefined,
            href: editing.href?.trim() || undefined,
            active: editing.active ?? true,
            sortOrder: Number(editing.sortOrder) || sorted.length + 1,
            id: editing.isNew ? undefined : editing.id,
          },
        }),
      );
      if (!res.ok) {
        setError(res.error ?? "هەڵە");
        return;
      }
      setEditing({});
      reloadAdmin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "هەڵە");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <p className="mb-0.5 text-[10px] font-semibold text-bk-accent">هەنگاو ٤</p>
      <h2 className="mb-2 text-sm font-bold text-bk-accent">پەیوەندیمان</h2>
      <p className="mb-3 text-xs text-bk-muted">
        {ADMIN_KURDISH_ONLY_HINT} · ژمارە یان لینکی پەڕە پێویستە
      </p>
      {error ? <p className="mb-2 text-xs text-red-300">{error}</p> : null}
      <button
        type="button"
        className="btn-outline mb-3 w-full"
        onClick={startNew}
      >
        + پەیوەندی نوێ
      </button>

      {showForm ? (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <AdminKurdishNameFields
            ckbPlaceholder="ناونیشان (کوردی) *"
            values={{
              ckb: editing.labelCkb ?? "",
              ar: editing.labelAr,
              en: editing.labelEn,
            }}
            onChange={(p) =>
              setEditing((s) => ({
                ...s,
                ...(p.ckb !== undefined ? { labelCkb: p.ckb } : {}),
                ...(p.ar !== undefined ? { labelAr: p.ar } : {}),
                ...(p.en !== undefined ? { labelEn: p.en } : {}),
              }))
            }
            showMore={moreNames}
            onToggleMore={() => setMoreNames((v) => !v)}
          />
          <input
            placeholder="ژمارە (0750…)"
            value={editing.phone ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, phone: e.target.value }))}
            inputMode="tel"
          />
          <input
            placeholder="لینکی پەڕە (https://…)"
            value={editing.href ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, href: e.target.value }))}
          />
          <input
            type="number"
            placeholder="ڕیز (sortOrder)"
            value={editing.sortOrder ?? 0}
            onChange={(e) =>
              setEditing((s) => ({ ...s, sortOrder: Number(e.target.value) }))
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.active ?? true}
              onChange={(e) =>
                setEditing((s) => ({ ...s, active: e.target.checked }))
              }
            />
            چالاک
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1"
              disabled={saving}
              onClick={() => void save()}
            >
              پاشەکەوت
            </button>
            <button
              type="button"
              className="btn-outline flex-1"
              onClick={() => setEditing({})}
            >
              پاشگەزبوونەوە
            </button>
          </div>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {sorted.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm"
          >
            <p className="font-semibold">{c.labelCkb}</p>
            <p className="text-xs text-bk-muted">
              {[c.phone, c.href].filter(Boolean).join(" · ") || "—"}
            </p>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                className="text-bk-accent"
                onClick={() => setEditing({ ...c })}
              >
                دەستکاری
              </button>
              <button
                type="button"
                className="text-red-300"
                onClick={() =>
                  void (async () => {
                    const res = await adminPostJson<{ ok?: boolean; error?: string }>(
                      "/api/admin/contacts",
                      { op: "delete", id: c.id },
                    );
                    if (!res.ok) setError(res.error ?? "هەڵە");
                    else reloadAdmin();
                  })()
                }
              >
                سڕینەوە
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}