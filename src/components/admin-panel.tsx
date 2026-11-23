"use client";

import Image from "next/image";
import { reloadAdmin } from "@/lib/admin-mutate";
import { useRef, useState, useTransition } from "react";
import type {
  Brand,
  Category,
  ContactLink,
  Product,
  PromoSlide,
  StoreSettings,
} from "@/lib/types";
import { AdminSlides } from "./admin-slides";
import { AdminCategories } from "./admin-categories";
import { AdminContacts } from "./admin-contacts";
import { AdminBrands } from "./admin-brands";
import { AdminStoreGuide } from "./admin-store-guide";
import { AdminSellers } from "./admin-sellers";
import { AdminLoginScreen } from "./admin-login-screen";
import {
  deleteProductAction,
  saveProductAction,
  saveStoreSettingsAction,
  uploadBackgroundAction,
  uploadProductImageAction,
} from "@/lib/actions";

type Props = {
  authed: boolean;
  categories: Category[];
  products: Product[];
  slides: PromoSlide[];
  contacts: ContactLink[];
  brands: Brand[];
  settings: StoreSettings;
};

export function AdminPanel({
  authed,
  categories,
  products,
  slides,
  contacts,
  brands,
  settings,
}: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [heroCaptionCkb, setHeroCaptionCkb] = useState(
    settings.heroCaptionCkb ?? "",
  );

  const [editing, setEditing] = useState<Partial<Product> & { isNew?: boolean }>(
    {},
  );

  const showForm = Boolean(editing.isNew || editing.id);

  if (!authed) {
    return <AdminLoginScreen />;
  }

  const startNew = () =>
    setEditing({
      isNew: true,
      categoryId: categories[0]?.id ?? "",
      nameCkb: "",
      nameAr: "",
      nameEn: "",
      priceIqd: 0,
      imageUrl: "",
      active: true,
    });

  const uploadBackground = async (file: File) => {
    setBgUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await uploadBackgroundAction(formData);
      if (!res.ok) {
        setError(res.error ?? "بارکردن سەرنەکەوتی");
        return;
      }
      const saved = await saveStoreSettingsAction({ motionBackgroundUrl: res.url });
      if (!saved.ok) setError(saved.error ?? "هەڵە");
      else reloadAdmin();
    } finally {
      setBgUploading(false);
      if (bgFileRef.current) bgFileRef.current.value = "";
    }
  };

  const uploadHero = async (file: File) => {
    setHeroUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await uploadProductImageAction(formData);
      if (!res.ok) {
        setError(res.error ?? "بارکردن سەرنەکەوتی");
        return;
      }
      const saved = await saveStoreSettingsAction({
        heroImageUrl: res.url,
        heroCaptionCkb: heroCaptionCkb || settings.heroCaptionCkb,
      });
      if (!saved.ok) setError(saved.error ?? "هەڵە");
      else reloadAdmin();
    } finally {
      setHeroUploading(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  };

  const saveHeroCaption = () =>
    start(async () => {
      const res = await saveStoreSettingsAction({
        heroCaptionCkb,
        heroCaptionAr: settings.heroCaptionAr,
        heroCaptionEn: settings.heroCaptionEn,
      });
      if (!res.ok) setError(res.error ?? "هەڵە");
      else reloadAdmin();
    });

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await uploadProductImageAction(formData);
      if (!res.ok) {
        setError(res.error ?? "بارکردن سەرنەکەوتی");
        return;
      }
      setEditing((s) => ({ ...s, imageUrl: res.url }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () =>
    start(async () => {
      if (!editing.categoryId) return;
      const payload = {
        categoryId: editing.categoryId,
        brandId: editing.brandId || undefined,
        nameCkb: editing.nameCkb ?? "",
        nameAr: editing.nameAr ?? "",
        nameEn: editing.nameEn ?? "",
        descriptionCkb: editing.descriptionCkb,
        descriptionAr: editing.descriptionAr,
        descriptionEn: editing.descriptionEn,
        priceIqd: Number(editing.priceIqd) || 0,
        imageUrl: editing.imageUrl,
        active: editing.active ?? true,
        id: editing.isNew ? undefined : editing.id,
      };
      const res = await saveProductAction(payload);
      if (!res.ok) setError(res.error ?? "هەڵە");
      else {
        setEditing({});
        setError(null);
        reloadAdmin();
      }
    });

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">پانێڵی بەڕێوەبەر</h1>
        <button
          type="button"
          className="text-sm text-bk-muted"
          disabled={pending}
          onClick={() =>
            start(async () => {
              try {
                await fetch("/api/admin/logout", {
                  method: "POST",
                  credentials: "include",
                });
              } catch {
                /* ignore */
              }
              window.location.replace("/admin?out=1");
            })
          }
        >
          دەرچوون
        </button>
      </div>

      <AdminStoreGuide />

      <AdminSellers
        logins={settings.adminLegacyAccounts?.map((a) => a.login) ?? []}
      />

      <section className="glass mb-6 rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-bold text-bk-accent">
          وێنەی جووڵاو (بەشی سەرەوەی پاشبنەوە)
        </h2>
        <p className="mb-3 text-xs text-bk-muted">
          GIFی قاوە/splash لە Pinterest — تەنها لە سەرەوەی ئاپ، نەک تەواوی شاشە.
        </p>
        {settings.motionBackgroundUrl ? (
          <div className="relative mb-3 h-24 w-full overflow-hidden rounded-xl">
            <Image
              src={settings.motionBackgroundUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        ) : null}
        <input
          ref={bgFileRef}
          type="file"
          accept="image/*,image/gif"
          className="mb-2 text-sm"
          disabled={bgUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadBackground(file);
          }}
        />
        {bgUploading ? (
          <p className="text-xs text-bk-accent">بارکردن…</p>
        ) : null}
      </section>

      <section className="glass mb-6 rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-bold text-bk-accent">
          وێنەی سەرەکی (کارەکەی براند)
        </h2>
        <p className="mb-3 text-xs text-bk-muted">
          وێنەی شوێنی کار، بەرهەم، یان کۆفی باڕ — لە سەرەوەی ئاپ دەردەکەوێت.
        </p>
        {settings.heroImageUrl ? (
          <div className="relative mb-3 h-32 w-full overflow-hidden rounded-xl">
            <Image
              src={settings.heroImageUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        ) : null}
        <input
          ref={heroFileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="mb-2 text-sm"
          disabled={heroUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadHero(file);
          }}
        />
        {heroUploading ? (
          <p className="text-xs text-bk-accent">بارکردن…</p>
        ) : null}
        <input
          className="mt-2"
          placeholder="دەق لەسەر وێنە (کوردی)"
          value={heroCaptionCkb}
          onChange={(e) => setHeroCaptionCkb(e.target.value)}
        />
        <button
          type="button"
          className="btn-outline mt-2 w-full"
          disabled={pending}
          onClick={saveHeroCaption}
        >
          پاشەکەوتی دەق
        </button>
      </section>

      <AdminCategories categories={categories} />

      <AdminContacts contacts={contacts} />

      <AdminBrands brands={brands} categories={categories} />

      <AdminSlides slides={slides} products={products} />

      <button type="button" className="btn-outline mb-4 w-full" onClick={startNew}>
        + بەرهەمی نوێ
      </button>

      {error && authed ? (
        <p className="mb-3 text-center text-sm text-red-300">{error}</p>
      ) : null}

      {showForm ? (
        <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4">
          <select
            value={editing.categoryId ?? ""}
            onChange={(e) =>
              setEditing((s) => ({ ...s, categoryId: e.target.value }))
            }
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameCkb}
              </option>
            ))}
          </select>
          <select
            value={editing.brandId ?? ""}
            onChange={(e) =>
              setEditing((s) => ({
                ...s,
                brandId: e.target.value || undefined,
              }))
            }
          >
            <option value="">— براند (ئارەزوومەندانە) —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameCkb}
              </option>
            ))}
          </select>
          <input
            placeholder="ناوی کوردی"
            value={editing.nameCkb ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, nameCkb: e.target.value }))}
          />
          <input
            placeholder="الاسم عربي"
            value={editing.nameAr ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, nameAr: e.target.value }))}
          />
          <input
            placeholder="English name"
            value={editing.nameEn ?? ""}
            onChange={(e) => setEditing((s) => ({ ...s, nameEn: e.target.value }))}
          />
          <input
            type="number"
            placeholder="نرخ (IQD)"
            value={editing.priceIqd ?? 0}
            onChange={(e) =>
              setEditing((s) => ({ ...s, priceIqd: Number(e.target.value) }))
            }
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm text-bk-muted">وێنەی بەرهەم</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              capture="environment"
              className="text-sm file:mr-2 file:rounded-xl file:border-0 file:bg-bk-accent file:px-3 file:py-2 file:text-bk-bg"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file);
              }}
            />
            {uploading ? (
              <p className="text-xs text-bk-accent">بارکردن و بچووکردنەوەی وێنە…</p>
            ) : (
              <p className="text-xs text-bk-muted">
                تا 50MB — سێرڤەر خۆکار بچووکی دەکاتەوە (~WebP، نزیکەی 1MB بۆ
                فرۆشگا).
              </p>
            )}
            {editing.imageUrl ? (
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl bg-bk-deep">
                <Image
                  src={editing.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
            ) : null}
            <input
              placeholder="یان بەستەری وێنە (خۆکار فشردە دەکرێت)"
              value={editing.imageUrl ?? ""}
              onChange={(e) =>
                setEditing((s) => ({ ...s, imageUrl: e.target.value }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing.active ?? true}
              onChange={(e) => setEditing((s) => ({ ...s, active: e.target.checked }))}
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
        {products.map((p) => (
          <li key={p.id} className="glass rounded-2xl p-3 text-sm">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-semibold">{p.nameCkb}</p>
                <p className="text-bk-muted">{p.priceIqd.toLocaleString()} IQD</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-bk-accent"
                  onClick={() => setEditing({ ...p })}
                >
                  دەستکاری
                </button>
                <button
                  type="button"
                  className="text-red-300"
                  onClick={() =>
                    start(async () => {
                      await deleteProductAction(p.id);
                      reloadAdmin();
                    })
                  }
                >
                  سڕینەوە
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}