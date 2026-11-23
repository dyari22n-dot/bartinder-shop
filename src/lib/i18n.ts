import type { Locale } from "./types";

export const locales: {
  code: Locale;
  label: string;
  dir: "rtl" | "ltr";
}[] = [
  { code: "ckb", label: "کوردی", dir: "rtl" },
  { code: "ar", label: "عەرەبی", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
];

export function pickLocale<T extends Record<string, string>>(
  locale: Locale,
  names: { nameCkb: string; nameAr: string; nameEn: string },
): string {
  if (locale === "ckb") return names.nameCkb;
  if (locale === "ar") return names.nameAr;
  return names.nameEn;
}

export const ui = {
  ckb: {
    home: "سەرەتا",
    categories: "بەشەکان",
    cart: "سەبەتە",
    search: "گەڕان",
    shopNow: "کڕین",
    categoryMenu: "مێنوی بەشەکان",
    bestSellers: "پڕفرۆشترین",
    addToCart: "زیادکردن بۆ سەبەتە",
    checkout: "تەواوکردنی داواکاری",
    whatsapp: "ناردن بۆ واتسئاپ",
    onlinePay: "پارەدان ئۆنلاین",
    emptyCart: "سەبەتەکە بەتاڵە",
    total: "کۆی گشتی",
    admin: "بەڕێوەبەر",
    language: "زمان",
    contact: "پەیوەندیمان",
    contactNav: "پەیوەندی",
    brands: "براندەکان",
    brand: "براند",
    back: "گەڕانەوە",
  },
  ar: {
    home: "الرئيسية",
    categories: "الأقسام",
    cart: "السلة",
    search: "بحث",
    shopNow: "تسوق",
    categoryMenu: "قائمة الأقسام",
    bestSellers: "الأكثر مبيعاً",
    addToCart: "أضف للسلة",
    checkout: "إتمام الطلب",
    whatsapp: "إرسال واتساب",
    onlinePay: "دفع أونلاين",
    emptyCart: "السلة فارغة",
    total: "المجموع",
    admin: "الإدارة",
    language: "اللغة",
    contact: "اتصل بنا",
    contactNav: "اتصل",
    brands: "العلامات",
    brand: "علامة",
    back: "رجوع",
  },
  en: {
    home: "Home",
    categories: "Categories",
    cart: "Cart",
    search: "Search",
    shopNow: "Shop now",
    categoryMenu: "Category menu",
    bestSellers: "Best sellers",
    addToCart: "Add to cart",
    checkout: "Checkout",
    whatsapp: "Send via WhatsApp",
    onlinePay: "Pay online",
    emptyCart: "Cart is empty",
    total: "Total",
    admin: "Admin",
    language: "Language",
    contact: "Contact",
    contactNav: "Contact",
    brands: "Brands",
    brand: "Brand",
    back: "Back",
  },
} as const;