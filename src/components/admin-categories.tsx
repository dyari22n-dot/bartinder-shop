"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { adminPostJson, scrollToAdminForm } from "@/lib/admin-api";
import { reloadAdmin } from "@/lib/admin-mutate";
import { ADMIN_KURDISH_ONLY_HINT } from "@/lib/locale-names";
import type { Category } from "@/lib/types";
import { AdminKurdishNameFields } from "./admin-kurdish-name-fields";
export function AdminCategories({ categories }: { categories: Category[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Category> & { isNew?: boolean }>(
    {},
  );
  const [pendingMotionFile, setPendingMotionFile] = useState<File | null>(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [moreNames, setMoreNames] = useState(false);

  useEffect(
    () => () => {
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    },
    [previewObjectUrl],
  );

  const setFilePreview = (file: File | null) => {
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPendingMotionFile(file);
  };

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const showForm = Boolean(editing.isNew || editing.id);

  const openEdit = (cat: Partial<Category> & { isNew?: boolean }) => {
    setEditing(cat);
    setError(null);
    scrollToAdminForm();
  };

  const startNew = () => {
    setMoreNames(false);
    setFilePreview(null);
    openEdit({
      isNew: true,
      nameCkb: "",
      nameAr: "",
      nameEn: "",
      motionMediaUrl: "",
    });
  };

  const uploadMotionForId = async (file: File, categoryId: string) => {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("categoryId", categoryId);
    const res = await fetch("/api/admin/categories/motion", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
    if (!data.ok) throw new Error(data.error ?? "بارکردن");
    return data.url;
  };

  const persistOrder = (ordered: Category[]) => {
    start(async () => {
      setError(null);
      const res = await adminPostJson<{ ok?: boolean; error?: string }>(
        "/api/admin/categories",
        { op: "reorder", ids: ordered.map((c) => c.id) },
      );
      if (!res.ok) setError(res.error ?? "هەڵە");
      else reloadAdmin();
    });
  };

  const move = (index: number, delta: -1 | 1) => {
    const j = index + delta;
    if (j < 0 || j >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[j]] = [next[j], next[index]];
    persistOrder(next);
  };

  const save = () =>
    start(async () => {
      setError(null);
      if (!editing.nameCkb?.trim()) {
        setError("ناوی کوردی پێویستە");
        return;
      }
      const res = await adminPostJson<{
        ok?: boolean;
        error?: string;
        category?: Category;
      }>("/api/admin/categories", {
        op: "save",
        category: {
          id: editing.isNew ? undefined : editing.id,
          nameCkb: editing.nameCkb ?? "",
          nameAr: editing.nameAr ?? "",
          nameEn: editing.nameEn ?? "",
          motionMediaUrl: editing.motionMediaUrl?.trim() || undefined,
          slug: editing.slug,
        },
      });
      if (!res.ok) {
        setError(res.error ?? "هەڵە");
        setSuccess(null);
        return;
      }
      const categoryId = res.category?.id ?? editing.id;
      const file = pendingMotionFile;
      if (file && categoryId) {
        setPreparingImage(true);
        try {
          const url = await uploadMotionForId(file, categoryId);
          await adminPostJson("/api/admin/categories", {
            op: "save",
            category: {
              id: categoryId,
              nameCkb: res.category?.nameCkb ?? editing.nameCkb ?? "",
              nameAr: res.category?.nameAr ?? editing.nameAr ?? "",
              nameEn: res.category?.nameEn ?? editing.nameEn ?? "",
              motionMediaUrl: url,
            },
          });
        } catch (e) {
          setError(
            `${e instanceof Error ? e.message : "بارکردنی فایل"} — BLOB_READ_WRITE_TOKEN لە Vercel`,
          );
          setSuccess(null);
          setPreparingImage(false);
          return;
        }
        setPreparingImage(false);
      }
      setSuccess(
        file
          ? "پاشەکەوت کرا ✓ (ناو + وێنە/ڤیدیۆ)"
          : "پاشەکەوت کرا ✓",
      );
      setFilePreview(null);
      setEditing({});
      setTimeout(() => reloadAdmin(), 400);
    });

  const isVideoFile = (file: File) =>
    file.type.startsWith("video/") || file.name.endsWith(".mp4");

  const uploadImageFromGallery = (file: File) => {
    setError(null);
    setFilePreview(file);
    if (editing.id && !editing.isNew) {
      setPreparingImage(true);
      start(async () => {
        try {
          const url = await uploadMotionForId(file, editing.id!);
          setEditing((s) => ({ ...s, motionMediaUrl: url }));
          setFilePreview(null);
        } catch (e) {
          setError(e instanceof Error ? e.message : "بارکردن");
        } finally {
          setPreparingImage(false);
        }
      });
    }
  };

  const onPickFile = (file: File) => {
    if (file.type === "image/gif" || isVideoFile(file)) {
      if (!editing.id || editing.isNew) {
        setFilePreview(file);
        setError(null);
        return;
      }
      start(async () => {
        try {
          const url = await uploadMotionForId(file, editing.id!);
          setEditing((s) => ({ ...s, motionMediaUrl: url }));
        } catch (e) {
          setError(e instanceof Error ? e.message : "بارکردن");
        }
      });
      return;
    }
    if (file.type.startsWith("image/")) {
      uploadImageFromGallery(file);
      return;
    }
    setError("جۆری فایل نەناسراو");
  };

  return (
    <section className="glass mb-6 rounded-2xl p-4">
      <p className="mb-0.5 text-[10px] font-semibold text-bk-accent">هەنگاو ١</p>
      <h2 className="mb-2 text-sm font-bold text-bk-accent">بەشەکان</h2>
      <p className="mb-3 text-xs text-bk-muted">
        {ADMIN_KURDISH_ONLY_HINT} · گالەری ~٨٠MB
      </p>
      {error ? (
        <p className="mb-2 rounded-lg border border-red-400/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mb-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-200">
          {success}
        </p>
      ) : null}

      <button type="button" className="btn-outline mb-3 w-full text-xs" onClick={startNew}>
        + بەشی نوێ
      </button>

      {showForm ? (
        <div
          id="admin-active-form"
          className="mb-4 flex flex-col gap-2 rounded-xl border border-bk-accent/30 bg-white/5 p-3"
        >
          <AdminKurdishNameFields
            values={{
              ckb: editing.nameCkb ?? "",
              ar: editing.nameAr,
              en: editing.nameEn,
            }}
            onChange={(p) =>
              setEditing((s) => ({
                ...s,
                ...(p.ckb !== undefined ? { nameCkb: p.ckb } : {}),
                ...(p.ar !== undefined ? { nameAr: p.ar } : {}),
                ...(p.en !== undefined ? { nameEn: p.en } : {}),
              }))
            }
            showMore={moreNames}
            onToggleMore={() => setMoreNames((v) => !v)}
          />
          {editing.motionMediaUrl || previewObjectUrl ? (
            <div className="relative h-24 w-full overflow-hidden rounded-xl bg-black/40">
              {(editing.motionMediaUrl || previewObjectUrl || "").includes(".mp4") ? (
                <video
                  src={editing.motionMediaUrl}
                  className="h-full w-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (editing.motionMediaUrl || "").startsWith("data:") ||
                previewObjectUrl ? (
                // biome-ignore lint/a11y/useAltText: admin preview
                <img
                  src={
                    previewObjectUrl ||
                    editing.motionMediaUrl ||
                    ""
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : editing.motionMediaUrl ? (
                <Image
                  src={editing.motionMediaUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
          ) : null}
          <input
            type="file"
            accept="image/*,video/mp4,.mp4,.gif"
            className="text-xs"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.target.value = "";
            }}
          />
          {preparingImage ? (
            <p className="text-[10px] text-bk-accent">
              وێنە گەورە دەگات… خۆکار بچووک دەکرێت (چەند چرکە)
            </p>
          ) : null}
          <input
            placeholder="یان بەستەری وێنە/ڤیدیۆ"
            value={editing.motionMediaUrl ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, motionMediaUrl: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1 text-xs"
              disabled={pending || preparingImage}
              onClick={() => void save()}
            >
              پاشەکەوت
            </button>
            <button
              type="button"
              className="btn-outline flex-1 text-xs"
              onClick={() => {
                setFilePreview(null);
                setEditing({});
              }}
            >
              پاشگەز
            </button>
          </div>
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {sorted.map((cat, index) => {
          const open = openId === cat.id;
          return (
            <li
              key={cat.id}
              className="rounded-xl border border-white/8 bg-white/5 px-2 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-8 shrink-0 items-center justify-center text-xs font-bold text-bk-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{cat.nameCkb}</p>
                  <p className="truncate text-[10px] text-bk-muted">{cat.slug}</p>
                </div>
                <button
                  type="button"
                  className="text-[10px] text-bk-accent"
                  onClick={() => {
                    setMoreNames(false);
                    openEdit({ ...cat });
                  }}
                >
                  دەستکاری
                </button>
                <button
                  type="button"
                  className="text-[10px] text-red-300"
                  onClick={() =>
                    void (async () => {
                      if (!confirm(`سڕینەوەی «${cat.nameCkb}»؟`)) return;
                      const res = await adminPostJson<{ ok?: boolean; error?: string }>(
                        "/api/admin/categories",
                        { op: "delete", id: cat.id },
                      );
                      if (!res.ok) setError(res.error ?? "هەڵە");
                      else reloadAdmin();
                    })
                  }
                >
                  سڕینەوە
                </button>
                <button
                  type="button"
                  className="text-[10px] text-bk-muted"
                  onClick={() => setOpenId(open ? null : cat.id)}
                >
                  {open ? "▲" : "▼"}
                </button>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 disabled:opacity-30"
                    disabled={pending || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 disabled:opacity-30"
                    disabled={pending || index === sorted.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {open && cat.motionMediaUrl ? (
                <div className="relative mt-2 h-20 w-full overflow-hidden rounded-lg">
                  {cat.motionMediaUrl.includes(".mp4") ? (
                    <video
                      src={cat.motionMediaUrl}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={cat.motionMediaUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {pending ? <p className="mt-2 text-center text-xs text-bk-accent">…</p> : null}
    </section>
  );
}