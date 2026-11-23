"use client";

import { reloadAdmin } from "@/lib/admin-mutate";
import { useState, useTransition } from "react";
import type { ContactLink } from "@/lib/types";
import { deleteContactAction, saveContactAction } from "@/lib/actions";

type Props = { contacts: ContactLink[] };

export function AdminContacts({ contacts }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<
    Partial<ContactLink> & { isNew?: boolean }
  >({});

  const sorted = [...contacts].sort((a, b) => a.sortOrder - b.sortOrder);
  const showForm = Boolean(editing.isNew || editing.id);

  const startNew = () =>
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

  const save = () =>
    start(async () => {
      setError(null);
      const res = await saveContactAction({
        labelCkb: editing.labelCkb ?? "",
        labelAr: editing.labelAr ?? "",
        labelEn: editing.labelEn ?? "",
        phone: editing.phone?.trim() || undefined,
        href: editing.href?.trim() || undefined,
        active: editing.active ?? true,
        sortOrder: Number(editing.sortOrder) || sorted.length + 1,
        id: editing.isNew ? undefined : editing.id,
      });
      if (!res.ok) {
        setError(res.error ?? "هەڵە");
        return;
      }
      setEditing({});
      reloadAdmin();
    });

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <h2 className="mb-2 text-sm font-bold text-bk-accent">پەیوەندیمان</h2>
      <p className="mb-3 text-xs text-bk-muted">
        ناونیشان، ژمارە (تەلەفۆن/واتسئاپ)، لینکی پەڕە (ئینستاگرام، …) — لە
        ماڵەوە و /contact دەردەکەوێت.
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
          <input
            placeholder="ناونیشان (کوردی) *"
            value={editing.labelCkb ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, labelCkb: e.target.value }))
            }
          />
          <input
            placeholder="العنوان عربي"
            value={editing.labelAr ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, labelAr: e.target.value }))
            }
          />
          <input
            placeholder="English label"
            value={editing.labelEn ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, labelEn: e.target.value }))
            }
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
              disabled={pending}
              onClick={save}
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
                  start(async () => {
                    await deleteContactAction(c.id);
                    reloadAdmin();
                  })
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