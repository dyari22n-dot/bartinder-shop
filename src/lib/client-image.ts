/** فشردن لە مۆبایل/براوزەر — بێ Storage، data:URL بۆ Firestore */

const MAX_EDGE = 1200;
const TARGET_BYTES = 165_000;

export async function fileToShopImageDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    throw new Error("تەنها وێنەی jpg/png/webp لە گالەری");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("وێنە ناکرێت");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/webp", quality);
  let approxBytes = Math.ceil((dataUrl.length * 3) / 4);

  while (approxBytes > TARGET_BYTES && quality > 0.45) {
    quality -= 0.07;
    dataUrl = canvas.toDataURL("image/webp", quality);
    approxBytes = Math.ceil((dataUrl.length * 3) / 4);
  }

  if (approxBytes > 240_000) {
    throw new Error("وێنە زۆر گەورەیە — لینکی وێنە بنووسە یان وێنەی بچووکتر هەڵبژێرە");
  }

  return dataUrl;
}