export type Locale = "ckb" | "ar" | "en";

export type Category = {
  id: string;
  slug: string;
  nameCkb: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  /** وێنە/GIF/ڤیدیۆی جووڵاو لە پاش بەرهەمەکانی بەش */
  motionMediaUrl?: string;
};

export type Brand = {
  id: string;
  slug: string;
  nameCkb: string;
  nameAr: string;
  nameEn: string;
  logoUrl?: string;
  /** بەشەکانی فرۆشگا کە ئەم براندە تێدا دەردەکەوێت (وەک قاوە) */
  categoryIds: string[];
  sortOrder: number;
  active: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  brandId?: string;
  nameCkb: string;
  nameAr: string;
  nameEn: string;
  descriptionCkb?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  priceIqd: number;
  /** ئارەزوومەندانە — لەگەڵ IQD پیشان دەدرێت */
  priceUsd?: number;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
};

export type PromoSlideKind = "product" | "offer" | "discount";

export type PromoSlide = {
  id: string;
  kind: PromoSlideKind;
  titleCkb: string;
  titleAr: string;
  titleEn: string;
  subtitleCkb?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  imageUrl?: string;
  productId?: string;
  href?: string;
  discountPercent?: number;
  active: boolean;
  sortOrder: number;
};

/** پەیوەندی — ناونیشان، ژمارە، لینکی پەڕە بۆ کڕیار */
export type ContactLink = {
  id: string;
  labelCkb: string;
  labelAr: string;
  labelEn: string;
  /** ژمارەی مۆبایل (tel / واتسئاپ) */
  phone?: string;
  /** لینکی پەڕە — ئینستاگرام، ماپ، … */
  href?: string;
  sortOrder: number;
  active: boolean;
};

export type StoreSettings = {
  /** وێنەی جووڵاو — تەنها لە بەشی سەرەوەی پاشبنەوە */
  motionBackgroundUrl?: string;
  heroImageUrl?: string;
  heroCaptionCkb?: string;
  heroCaptionAr?: string;
  heroCaptionEn?: string;
  /** ئیمەیڵەکانی ڕێگەی پێدراو بۆ چوونەژوورەوەی ئەدمین (Firebase) */
  adminEmails?: string[];
  /** چوونەژوورەوەی ناو + وشەی نهێنی (hash لە سێرڤەر) */
  adminLegacyAccounts?: AdminLegacyAccount[];
};

export type AdminLegacyAccount = {
  login: string;
  passwordHash: string;
};

export type StoreData = {
  categories: Category[];
  brands?: Brand[];
  products: Product[];
  slides: PromoSlide[];
  contacts?: ContactLink[];
  settings?: StoreSettings;
};