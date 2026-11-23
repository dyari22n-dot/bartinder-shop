export function formatStoreError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("FILE_TOO_LARGE") || msg.includes("فایل زۆر گەورەیە")) {
    return "فایل زۆر گەورەیە — وێنەی تر هەڵبژێرە یان لینک";
  }
  if (msg.includes("EROFS") || msg.includes("read-only")) {
    return "سێرڤەر فایل نانووسێت — Vercel Blob لە Dashboard";
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
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("quota")
  ) {
    return "Firestore quota تەواو بووە — Firebase Console → Billing (Blaze) یان سبەیی دووبارە هەوڵبدەرەوە";
  }
  if (msg.includes("BLOB_READ_WRITE_TOKEN")) {
    return msg;
  }
  if (msg.includes("credential لە Vercel ناگونجێت")) {
    return msg;
  }
  if (
    msg.includes("Firebase لە Vercel دانەنراوە") ||
    msg.includes("FIREBASE_SERVICE_ACCOUNT_B64")
  ) {
    return msg;
  }
  if (msg.includes("PERMISSION_DENIED") || msg.includes("permission")) {
    return "Firebase مۆڵەت نییە — service account → Firestore Rules / IAM";
  }
  if (
    msg.includes("NOT_FOUND") &&
    (msg.includes("database") || msg.includes("Database"))
  ) {
    return "Firestore database هەڵەیە — لە Vercel: FIRESTORE_DATABASE_ID=default";
  }
  if (msg.includes("Firestore") || msg.includes("Firebase")) {
    const short = msg.replace(/\s+/g, " ").slice(0, 120);
    return `پاشەکەوت بۆ Firebase سەرنەکەوت (${short})`;
  }
  if (msg.includes('"code": 404') || msg.includes('"code":404')) {
    return "Storage یان لینک — لینکی وێنە بەکاربهێنە";
  }
  return msg.slice(0, 160) || "هەڵەی پاشەکەوت";
}