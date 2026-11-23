import sharp from "sharp";

/** گەورەترین فایلی وەرگیراو لە admin (دوای ئەمە فشردن دەکرێت) */
export const MAX_UPLOAD_BYTES = 80 * 1024 * 1024;

/** ئامانج بۆ Vercel Blob / Storage — وێنەی گەورەی گالەری خۆکار بچووک دەبێت */
const TARGET_BYTES = 1_150 * 1024;
const EDGES_PX = [2048, 1800, 1600, 1400, 1200] as const;

export async function optimizeProductImage(
  input: Buffer,
): Promise<{ data: Buffer; ext: "webp" }> {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const pixels = (meta.width ?? 0) * (meta.height ?? 0);

  let quality = 88;
  if (input.length > 6 * 1024 * 1024) quality = 84;
  if (input.length > 15 * 1024 * 1024) quality = 80;
  if (input.length > 30 * 1024 * 1024) quality = 76;
  if (pixels > 12_000_000) quality = Math.min(quality, 78);

  let data = await render(input, EDGES_PX[0], quality);

  for (const edge of EDGES_PX) {
    while (data.length > TARGET_BYTES && quality > 52) {
      quality -= 4;
      data = await render(input, edge, quality);
    }
    if (data.length <= TARGET_BYTES) break;
    quality = Math.max(52, quality - 6);
    data = await render(input, edge, quality);
    if (data.length <= TARGET_BYTES) break;
  }

  return { data, ext: "webp" };
}

async function render(
  input: Buffer,
  maxEdge: number,
  quality: number,
): Promise<Buffer> {
  return sharp(input, { failOn: "none", animated: false })
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toBuffer();
}