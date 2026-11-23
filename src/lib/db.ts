import { randomUUID } from "node:crypto";
import { cache } from "react";
import { readRawStore, writeRawStore } from "./store-persistence";
import type {
  Brand,
  Category,
  ContactLink,
  Product,
  PromoSlide,
  StoreData,
  StoreSettings,
} from "./types";
import { slugifyLabel } from "./slug";
import { resolveCategoryMotionUrl } from "./motion-url";

const readStore = cache(async (): Promise<StoreData> => readRawStore());

async function writeStore(data: StoreData): Promise<void> {
  await writeRawStore(data);
}

async function enrichCategoryMotion(categories: Category[]): Promise<Category[]> {
  return Promise.all(
    categories.map(async (cat) => {
      const base = cat.motionMediaUrl?.split("?")[0];
      if (
        base &&
        (base.startsWith("http") ||
          base.startsWith("data:") ||
          base.startsWith("blob:"))
      ) {
        return cat;
      }
      const motionMediaUrl = await resolveCategoryMotionUrl(cat);
      if (!motionMediaUrl) return cat;
      return { ...cat, motionMediaUrl };
    }),
  );
}

export const getStore = cache(async (): Promise<StoreData> => {
  const store = await readStore();
  if (!store.slides) store.slides = [];
  if (!store.contacts) store.contacts = [];
  if (!store.brands) store.brands = [];
  store.categories = await enrichCategoryMotion(store.categories);
  return store;
});

/** بەبێ enrich — بۆ ئەدمین وەک bootstrap */
export async function getStoreForAdmin(): Promise<StoreData> {
  const store = await readStore();
  if (!store.slides) store.slides = [];
  if (!store.contacts) store.contacts = [];
  if (!store.brands) store.brands = [];
  if (!store.settings) store.settings = {};
  return store;
}

export async function getActiveBrands(): Promise<Brand[]> {
  const store = await getStore();
  return (store.brands ?? [])
    .filter((b) => b.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveContacts(): Promise<ContactLink[]> {
  const store = await getStore();
  return (store.contacts ?? [])
    .filter((c) => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveSlides(): Promise<PromoSlide[]> {
  const store = await getStore();
  return store.slides
    .filter((s) => s.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveProducts(): Promise<Product[]> {
  const store = await readStore();
  return store.products.filter((p) => p.active);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const store = await readStore();
  return store.products.find((p) => p.id === id);
}

export type ProductInput = Omit<Product, "id" | "createdAt">;

export async function upsertProduct(
  input: ProductInput & { id?: string },
): Promise<Product> {
  const store = await readStore();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = store.products.findIndex((p) => p.id === input.id);
    if (idx === -1) throw new Error("Product not found");
    const updated: Product = { ...store.products[idx], ...input, id: input.id };
    store.products[idx] = updated;
    await writeStore(store);
    return updated;
  }
  const created: Product = {
    ...input,
    id: randomUUID(),
    createdAt: now,
  };
  store.products.push(created);
  await writeStore(store);
  return created;
}

export async function deleteProduct(id: string): Promise<void> {
  const store = await readStore();
  store.products = store.products.filter((p) => p.id !== id);
  await writeStore(store);
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const store = await readStore();
  return store.settings ?? {};
}

export async function updateStoreSettings(
  patch: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const store = await readStore();
  store.settings = { ...store.settings, ...patch };
  await writeStore(store);
  return store.settings;
}

export type PromoSlideInput = Omit<PromoSlide, "id">;

export async function upsertSlide(
  input: PromoSlideInput & { id?: string },
): Promise<PromoSlide> {
  const store = await readStore();
  if (!store.slides) store.slides = [];
  if (input.id) {
    const idx = store.slides.findIndex((s) => s.id === input.id);
    if (idx === -1) throw new Error("Slide not found");
    const updated: PromoSlide = { ...store.slides[idx], ...input, id: input.id };
    store.slides[idx] = updated;
    await writeStore(store);
    return updated;
  }
  const created: PromoSlide = {
    ...input,
    id: randomUUID(),
  };
  store.slides.push(created);
  await writeStore(store);
  return created;
}

export async function deleteSlide(id: string): Promise<void> {
  const store = await readStore();
  store.slides = (store.slides ?? []).filter((s) => s.id !== id);
  await writeStore(store);
}

export type ContactLinkInput = Omit<ContactLink, "id">;

export async function upsertContact(
  input: ContactLinkInput & { id?: string },
): Promise<ContactLink> {
  const store = await readStore();
  if (!store.contacts) store.contacts = [];
  if (input.id) {
    const idx = store.contacts.findIndex((c) => c.id === input.id);
    if (idx === -1) throw new Error("Contact not found");
    const updated: ContactLink = { ...store.contacts[idx], ...input, id: input.id };
    store.contacts[idx] = updated;
    await writeStore(store);
    return updated;
  }
  const created: ContactLink = { ...input, id: randomUUID() };
  store.contacts.push(created);
  await writeStore(store);
  return created;
}

export async function deleteContact(id: string): Promise<void> {
  const store = await readStore();
  store.contacts = (store.contacts ?? []).filter((c) => c.id !== id);
  await writeStore(store);
}

export type BrandInput = Omit<Brand, "id" | "slug"> & { slug?: string };

export async function upsertBrand(
  input: BrandInput & { id?: string },
): Promise<Brand> {
  const store = await readStore();
  if (!store.brands) store.brands = [];
  const slug =
    input.slug?.trim() ||
    slugifyLabel(input.nameEn || input.nameCkb, `brand-${randomUUID().slice(0, 8)}`);
  const { slug: _s, ...rest } = input;
  const body = { ...rest, slug, categoryIds: input.categoryIds ?? [] };

  if (input.id) {
    const idx = store.brands.findIndex((b) => b.id === input.id);
    if (idx === -1) throw new Error("Brand not found");
    const updated: Brand = { ...store.brands[idx], ...body, id: input.id };
    store.brands[idx] = updated;
    await writeStore(store);
    return updated;
  }
  let id = slug;
  if (store.brands.some((b) => b.id === id)) {
    id = randomUUID();
  }
  const created: Brand = { ...body, id };
  store.brands.push(created);
  await writeStore(store);
  return created;
}

export async function deleteBrand(id: string): Promise<void> {
  const store = await readStore();
  store.brands = (store.brands ?? []).filter((b) => b.id !== id);
  for (const p of store.products) {
    if (p.brandId === id) p.brandId = undefined;
  }
  await writeStore(store);
}

/** ڕیزبەندی بەشەکان — sortOrder لە 1 دەست پێدەکات */
export type CategoryInput = Pick<
  Category,
  "nameCkb" | "nameAr" | "nameEn" | "motionMediaUrl"
> & { slug?: string; sortOrder?: number };

export async function upsertCategory(
  input: CategoryInput & { id?: string },
): Promise<Category> {
  const store = await readStore();
  const slug =
    input.slug?.trim() ||
    slugifyLabel(input.nameEn || input.nameCkb, `cat-${randomUUID().slice(0, 8)}`);

  if (input.id) {
    const idx = store.categories.findIndex((c) => c.id === input.id);
    if (idx === -1) throw new Error("Category not found");
    const updated: Category = {
      ...store.categories[idx],
      ...input,
      slug,
      id: input.id,
    };
    store.categories[idx] = updated;
    await writeStore(store);
    return updated;
  }

  let id = slug;
  if (store.categories.some((c) => c.id === id)) {
    id = randomUUID();
  }
  const sortOrder =
    input.sortOrder ??
    Math.max(0, ...store.categories.map((c) => c.sortOrder)) + 1;
  const created: Category = {
    id,
    slug,
    nameCkb: input.nameCkb,
    nameAr: input.nameAr,
    nameEn: input.nameEn,
    motionMediaUrl: input.motionMediaUrl,
    sortOrder,
  };
  store.categories.push(created);
  await writeStore(store);
  return created;
}

export async function deleteCategory(id: string): Promise<void> {
  const store = await readStore();
  const count = store.products.filter((p) => p.categoryId === id).length;
  if (count > 0) {
    throw new Error(`CAT_HAS_PRODUCTS:${count}`);
  }
  store.categories = store.categories.filter((c) => c.id !== id);
  for (const b of store.brands ?? []) {
    b.categoryIds = b.categoryIds.filter((cid) => cid !== id);
  }
  await writeStore(store);
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, "nameCkb" | "nameAr" | "nameEn" | "motionMediaUrl">>,
): Promise<Category> {
  const store = await readStore();
  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Category not found");
  const updated: Category = { ...store.categories[idx], ...patch };
  store.categories[idx] = updated;
  await writeStore(store);
  return updated;
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<Category[]> {
  const store = await readStore();
  const byId = new Map(store.categories.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const next: Category[] = [];

  for (const id of orderedIds) {
    const cat = byId.get(id);
    if (!cat || seen.has(id)) continue;
    seen.add(id);
    next.push(cat);
  }
  for (const cat of store.categories) {
    if (!seen.has(cat.id)) next.push(cat);
  }

  store.categories = next.map((cat, i) => ({ ...cat, sortOrder: i + 1 }));
  await writeStore(store);
  return store.categories;
}