"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPanel } from "./admin-panel";
import { AdminLoginScreen } from "./admin-login-screen";
import type {
  Brand,
  Category,
  ContactLink,
  Product,
  PromoSlide,
  StoreSettings,
} from "@/lib/types";

type AdminStore = {
  categories: Category[];
  products: Product[];
  slides: PromoSlide[];
  contacts: ContactLink[];
  brands: Brand[];
  settings: StoreSettings;
};

const emptyStore: AdminStore = {
  categories: [],
  products: [],
  slides: [],
  contacts: [],
  brands: [],
  settings: {},
};

type MeResponse = {
  authed: boolean;
  store?: AdminStore;
  error?: string;
};

export function AdminShell() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [store, setStore] = useState<AdminStore>(emptyStore);
  const [bootError, setBootError] = useState<string | null>(null);

  const load = useCallback((forceUnauthed = false) => {
    if (forceUnauthed) {
      setAuthed(false);
      setReady(true);
      setStore(emptyStore);
      setBootError(null);
      return;
    }
    setBootError(null);
    void fetch("/api/admin/me", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("api");
        return (await res.json()) as MeResponse;
      })
      .then((res) => {
        setAuthed(res.authed);
        if (res.store) {
          setStore({
            categories: res.store.categories ?? [],
            products: res.store.products ?? [],
            slides: res.store.slides ?? [],
            contacts: res.store.contacts ?? [],
            brands: res.store.brands ?? [],
            settings: res.store.settings ?? {},
          });
        }
        if (res.error) setBootError(res.error);
        setReady(true);
      })
      .catch(() => {
        setAuthed(false);
        setBootError("پەیوەندی سێرڤەر — دووبارە هەوڵ بدەرەوە");
        setReady(true);
      });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("out") === "1") {
        load(true);
        window.history.replaceState({}, "", "/admin");
        return;
      }
      load();
    });
  }, [load]);

  const onLoggedIn = useCallback(() => {
    setReady(false);
    load();
  }, [load]);

  if (!ready) {
    return (
      <p className="flex min-h-dvh items-center justify-center text-sm text-bk-muted">
        …
      </p>
    );
  }

  if (!authed) {
    return (
      <>
        {bootError ? (
          <p className="mx-auto max-w-md px-4 pt-4 text-center text-sm text-red-300">
            {bootError}
          </p>
        ) : null}
        <AdminLoginScreen onLoggedIn={onLoggedIn} />
      </>
    );
  }

  return (
    <AdminPanel
      authed
      categories={store.categories}
      products={store.products}
      slides={store.slides}
      contacts={store.contacts}
      brands={store.brands}
      settings={store.settings}
    />
  );
}