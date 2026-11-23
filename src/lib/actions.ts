"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import {
  deleteBrand,
  deleteContact,
  deleteProduct,
  deleteSlide,
  getStore,
  reorderCategories,
  deleteCategory,
  updateCategory,
  upsertCategory,
  updateStoreSettings,
  type CategoryInput,
  upsertBrand,
  upsertContact,
  upsertProduct,
  upsertSlide,
  type BrandInput,
  type ContactLinkInput,
  type ProductInput,
  type PromoSlideInput,
} from "./db";
import type { StoreSettings } from "./types";
import { firebaseAdminEnabled } from "./firebase-admin";
import { persistentStoreEnabled, syncJsonToBlob } from "./store-persistence";
import { MAX_UPLOAD_BYTES } from "./optimize-image";
import { ingestImageUrl, saveOptimizedImageFile } from "./image-ingest";
import { persistMediaFile, storageHint } from "./media-upload";
import { formatStoreError } from "./action-errors";

import {
  adminSessionMaxAgeSec,
  getAdminAuth,
  isEmailAllowedForAdmin,
} from "./admin-session";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_COOKIE,
  LEGACY_AUTH_TOKEN,
} from "./admin-cookies";
import { checkAdminCookies, isLegacyAuthed } from "./admin-check";

function adminSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "bartender2026";
}

export async function adminLogin(
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await connection();
    const secret = adminSecret();
    if (password !== secret) return { ok: false, error: "وشەی نهێنی هەڵەیە" };
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, LEGACY_AUTH_TOKEN, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
    });
    jar.delete(ADMIN_SESSION_COOKIE);
    return { ok: true };
  } catch (e) {
    console.error("[admin] login failed:", e);
    return { ok: false, error: "هەڵەی سێرڤەر" };
  }
}

export async function adminSessionFromIdToken(
  idToken: string,
): Promise<{ ok: boolean; error?: string }> {
  await connection();
  if (!firebaseAdminEnabled()) {
    return { ok: false, error: "Firebase لە سێرڤەر ڕێکخراو نییە" };
  }
  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const email = decoded.email?.trim() ?? "";
    if (!email) return { ok: false, error: "ئیمەیڵ لە هەژماردا نییە" };
    if (decoded.email_verified !== true) {
      return { ok: false, error: "ئیمەیڵ پشتڕاست نەکراوە" };
    }
    if (!(await isEmailAllowedForAdmin(email))) {
      return { ok: false, error: "ئەم ئیمەیڵە ڕێگەی پێنەدراوە — لە ئەدمین زیاد بکە" };
    }
    const expiresIn = adminSessionMaxAgeSec() * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const jar = await cookies();
    jar.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: adminSessionMaxAgeSec(),
      secure: process.env.NODE_ENV === "production",
    });
    jar.delete(ADMIN_COOKIE);
    return { ok: true };
  } catch {
    return { ok: false, error: "تۆکن نادروستە" };
  }
}

export async function adminLogout(): Promise<void> {
  await connection();
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const clear = (name: string) => {
    jar.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      secure,
    });
  };
  const session = jar.get(ADMIN_SESSION_COOKIE)?.value;
  clear(ADMIN_COOKIE);
  clear(ADMIN_SESSION_COOKIE);
  if (session && firebaseAdminEnabled()) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(session, true);
      await getAdminAuth().revokeRefreshTokens(decoded.uid);
    } catch {
      /* ignore */
    }
  }
}

export async function checkAdmin(): Promise<boolean> {
  return checkAdminCookies();
}

export async function getAdminBootstrapAction(): Promise<{
  authed: boolean;
  store?: Awaited<ReturnType<typeof getStore>>;
  error?: string;
}> {
  try {
    await connection();
    const authed = await checkAdmin();
    if (!authed) return { authed: false };
    const { getStoreForAdmin } = await import("./db");
    return { authed: true, store: await getStoreForAdmin() };
  } catch (e) {
    console.error("[admin] bootstrap failed:", e);
    const authed = await checkAdmin().catch(() => false);
    return {
      authed,
      error: authed
        ? "داتا بارنەبوو — Reload بکە"
        : undefined,
    };
  }
}

export async function saveProductAction(
  input: ProductInput & { id?: string },
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };

  let imageUrl = input.imageUrl;
  if (imageUrl?.startsWith("http://") || imageUrl?.startsWith("https://")) {
    try {
      imageUrl = await ingestImageUrl(imageUrl);
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      if (code === "FILE_TOO_LARGE") {
        return { ok: false, error: "وێنەکە زۆر گەورەیە (زیاتر لە 50MB)" };
      }
      return { ok: false, error: "وێنەکە لە بەستەرەکە دابەزێنرانی بوو" };
    }
  }

  try {
    await upsertProduct({ ...input, imageUrl });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function saveSlideAction(
  input: PromoSlideInput & { id?: string },
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await upsertSlide(input);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function deleteSlideAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await deleteSlide(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function saveContactAction(
  input: ContactLinkInput & { id?: string },
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  if (!input.labelCkb?.trim()) {
    return { ok: false, error: "ناونیشان پێویستە" };
  }
  if (!input.phone?.trim() && !input.href?.trim()) {
    return { ok: false, error: "ژمارە یان لینکی پەڕە بنووسە" };
  }
  try {
    await upsertContact(input);
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function deleteContactAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await deleteContact(id);
    revalidatePath("/");
    revalidatePath("/contact");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function saveBrandAction(
  input: BrandInput & { id?: string },
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  if (!input.nameCkb?.trim()) {
    return { ok: false, error: "ناوی براند پێویستە" };
  }
  try {
    await upsertBrand(input);
    revalidatePath("/");
    revalidatePath("/brands");
    revalidatePath("/search");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function deleteBrandAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await deleteBrand(id);
    revalidatePath("/");
    revalidatePath("/brands");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function deleteProductAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await deleteProduct(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function loadStoreAction() {
  return getStore();
}

export async function syncBlobAction(): Promise<{
  ok: boolean;
  error?: string;
  message?: string;
}> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  if (!persistentStoreEnabled()) {
    return { ok: false, error: "پاشەکەوتی کلاود ڕێکنەخراوە" };
  }
  try {
    const res = await syncJsonToBlob();
    return res.ok
      ? { ok: true, message: res.message }
      : { ok: false, error: res.message };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Blob هەڵە",
    };
  }
}

/** @deprecated */
export const syncFirestoreAction = syncBlobAction;

export async function reorderCategoriesAction(
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  if (orderedIds.length === 0) {
    return { ok: false, error: "لیستەکە بەتاڵە" };
  }
  try {
    await reorderCategories(orderedIds);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function saveCategoryAction(
  input: CategoryInput & { id?: string },
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  if (!input.nameCkb?.trim()) {
    return { ok: false, error: "ناوی کوردی پێویستە" };
  }
  try {
    await upsertCategory(input);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await deleteCategory(id);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function updateCategoryAction(
  id: string,
  patch: {
    nameCkb?: string;
    nameAr?: string;
    nameEn?: string;
    motionMediaUrl?: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await updateCategory(id, patch);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/categories");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function uploadCategoryMotionAction(
  categoryId: string,
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await connection();
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "فایل هەڵنەبژێردراوە" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "فایل زۆر گەورەیە" };
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4");
  const isGif = file.type === "image/gif";

  try {
    const ext = isVideo ? "mp4" : isGif ? "gif" : "webp";
    const url = await persistMediaFile(raw, {
      ext,
      contentType: file.type || (isVideo ? "video/mp4" : "image/webp"),
      optimizeImage: !isVideo && !isGif,
    });
    await updateCategory(categoryId, { motionMediaUrl: url });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, url };
  } catch (e) {
    return {
      ok: false,
      error: `${formatStoreError(e)} · ${storageHint()}`,
    };
  }
}

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function saveStoreSettingsAction(
  patch: Partial<StoreSettings>,
): Promise<{ ok: boolean; error?: string }> {
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };
  try {
    await updateStoreSettings(patch);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) };
  }
}

export async function uploadBackgroundAction(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await connection();
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "وێنە هەڵنەبژێردراوە" };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "فایلەکە زۆر گەورەیە" };
  }

  const raw = Buffer.from(await file.arrayBuffer());

  try {
    if (file.type === "image/gif") {
      const url = await persistMediaFile(raw, {
        ext: "gif",
        contentType: "image/gif",
        optimizeImage: false,
      });
      return { ok: true, url };
    }
    const { url } = await saveOptimizedImageFile(raw);
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: formatStoreError(e) || storageHint() };
  }
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  await connection();
  const authed = await checkAdmin();
  if (!authed) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "وێنە هەڵنەبژێردراوە" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "وێنەکە زۆر گەورەیە (زیاتر لە 50MB)" };
  }

  const knownType = IMAGE_TYPES.has(file.type);
  const looksLikeImage =
    knownType || file.type === "" || file.type === "application/octet-stream";
  if (!looksLikeImage) {
    return { ok: false, error: "تەنها وێنە (JPG, PNG, WEBP, …)" };
  }

  const raw = Buffer.from(await file.arrayBuffer());
  try {
    const { url } = await saveOptimizedImageFile(raw);
    return { ok: true, url };
  } catch (e) {
    if (e instanceof Error && e.message === "FILE_TOO_LARGE") {
      return { ok: false, error: "وێنەکە زۆر گەورەیە (زیاتر لە 50MB)" };
    }
    return { ok: false, error: formatStoreError(e) || storageHint() };
  }
}