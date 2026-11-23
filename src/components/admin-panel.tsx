"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { reloadAdmin } from "@/lib/admin-mutate";
import { backFallbackPath } from "@/lib/app-back";
import { useRef, useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
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
import { AdminProducts } from "./admin-products";
import { AdminStoreGuide } from "./admin-store-guide";
import { AdminSellers } from "./admin-sellers";
import { AdminLoginScreen } from "./admin-login-screen";
import { AdminSectionMarker, AdminSectionNav } from "./admin-section-nav";
import {
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
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [heroCaptionCkb, setHeroCaptionCkb] = useState(
    settings.heroCaptionCkb ?? "",
  );

  if (!authed) {
    return <AdminLoginScreen />;
  }

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

  return (
    <div className="admin-root mx-auto min-h-dvh max-w-lg px-4 py-8 text-white">
      <p className="mb-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push(backFallbackPath("/admin"));
            }
          }}
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          گەڕانەوە بۆ فرۆشگا
        </button>
      </p>
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

      <AdminSectionNav />

      <AdminStoreGuide />

      <AdminSectionMarker id="admin-sellers">
        <AdminSellers
          logins={settings.adminLegacyAccounts?.map((a) => a.login) ?? []}
        />
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-motion">
      <section className="glass mb-6 rounded-2xl p-4 ring-1 ring-white/5">
        <p className="mb-1 text-[10px] font-semibold text-bk-muted">دیزاین · پاشبنەوە</p>
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
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-hero">
      <section className="glass mb-6 rounded-2xl p-4 ring-1 ring-white/5">
        <p className="mb-1 text-[10px] font-semibold text-bk-muted">دیزاین · هێرو</p>
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
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-categories">
        <AdminCategories categories={categories} />
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-brands">
        <AdminBrands brands={brands} categories={categories} />
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-products">
        <AdminProducts
          categories={categories}
          products={products}
          brands={brands}
        />
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-contacts">
        <AdminContacts contacts={contacts} />
      </AdminSectionMarker>

      <AdminSectionMarker id="admin-slides">
        <AdminSlides slides={slides} products={products} />
      </AdminSectionMarker>

      {error ? (
        <p className="mb-3 text-center text-sm text-red-300">{error}</p>
      ) : null}
    </div>
  );
}