export function formatStoreError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("FILE_TOO_LARGE") || msg.includes("فایل زۆر گەورەیە")) {
    return "فایل زۆر گەورەیە — وێنەی تر هەڵبژێرە یان لینک";
  }
  if (msg.includes("EROFS") || msg.includes("read-only")) {
    return "سێرڤەر فایل نانووسێت — Firestore + Storage لە Vercel";
  }
  if (msg.startsWith("CAT_HAS_PRODUCTS:")) {
    const n = msg.split(":")[1];
    return `سڕینەوە ناکرێت — ${n} بەرهەم لەم بەشەدانە`;
  }
  if (
    msg.includes("STORAGE_URL_ONLY") ||
    msg.includes("bucket does not exist") ||
    msg.includes("The specified bucket does not exist")
  ) {
    return msg.includes("STORAGE_URL_ONLY:")
      ? msg.replace(/^STORAGE_URL_ONLY:\s*/, "")
      : "Storage لە Firebase نییە — لینکی وێنە لە خانەی خوارەوە بنووسە";
  }
  if (
    msg.includes("Firebase") ||
    msg.includes("NOT_FOUND") ||
    msg.includes("Firestore") ||
    msg.includes("FIREBASE")
  ) {
    return "پاشەکەوت بۆ Firebase سەرنەکەوتی — FIREBASE_SERVICE_ACCOUNT_B64 لە Vercel چەک بکە";
  }
  if (msg.includes('"code": 404') || msg.includes('"code":404')) {
    return "Storage یان لینک — لینکی وێنە بەکاربهێنە";
  }
  return msg.slice(0, 160) || "هەڵەی پاشەکەوت";
}