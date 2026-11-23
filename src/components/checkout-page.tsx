"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useLocale } from "./locale-provider";
import { useCart } from "@/store/cart";
import { buildWhatsAppUrl, cartTotals, formatCartTotals } from "@/lib/whatsapp";

type PayMethod = "whatsapp" | "online";

export function CheckoutPage({ catalog }: { catalog: Product[] }) {
  const { locale, t } = useLocale();
  const { items, count, clear } = useCart();
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<PayMethod>("whatsapp");

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = catalog.find((p) => p.id === item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter(Boolean) as { product: Product; quantity: number }[];
  }, [items, catalog]);

  const totals = useMemo(() => cartTotals(lines), [lines]);

  if (!hydrated) return null;

  if (count() === 0) {
    return (
      <p className="text-sm text-bk-muted">
        <Link href="/cart" className="text-bk-accent">
          {t.cart}
        </Link>
      </p>
    );
  }

  const note = [
    name && `ناو / Name: ${name}`,
    phone && `تەلەفۆن: ${phone}`,
    address && `ناونیشان: ${address}`,
    method === "online" ? "پارەدان: ئۆنلاین (FIB / حەواڵە)" : "",
  ]
    .filter(Boolean)
    .join("\n");

  const waUrl = buildWhatsAppUrl(lines, locale, note);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="text-lg font-bold text-white">{t.checkout}</h1>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-bk-muted">
          {locale === "en" ? "Full name" : locale === "ar" ? "الاسم" : "ناو"}
        </span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-bk-muted">
          {locale === "en" ? "Phone" : locale === "ar" ? "الهاتف" : "ژمارەی مۆبایل"}
        </span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-bk-muted">
          {locale === "en" ? "Address / city" : locale === "ar" ? "العنوان" : "ناونیشان"}
        </span>
        <textarea
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>

      <div className="glass rounded-2xl p-4">
        <p className="mb-3 text-sm font-medium text-white">
          {locale === "en"
            ? "Payment method"
            : locale === "ar"
              ? "طريقة الدفع"
              : "شێوازی پارەدان"}
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="pay"
              checked={method === "whatsapp"}
              onChange={() => setMethod("whatsapp")}
            />
            {t.whatsapp}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="pay"
              checked={method === "online"}
              onChange={() => setMethod("online")}
            />
            {t.onlinePay} (FIB / حەواڵە)
          </label>
        </div>
        {method === "online" ? (
          <p className="mt-3 text-xs leading-relaxed text-bk-muted">
            {locale === "ckb"
              ? "دوای ناردنی داواکاری، وردەکاری حەواڵە لە واتسئاپەوە دەنێردرێت. داتای FIB لە دواتردا دەبەسترێت."
              : locale === "ar"
                ? "بعد إرسال الطلب، نرسل تفاصيل التحويل عبر واتساب. ربط FIB لاحقاً."
                : "After you submit, we send transfer details on WhatsApp. FIB API can be connected later."}
          </p>
        ) : null}
      </div>

      <div className="glass flex justify-between rounded-2xl p-4 text-sm">
        <span className="text-bk-muted">{t.total}</span>
        <span className="font-bold text-bk-accent">
          {formatCartTotals(totals)}
        </span>
      </div>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
        onClick={() => {
          if (method === "whatsapp") clear();
        }}
      >
        {t.whatsapp}
      </a>
    </div>
  );
}