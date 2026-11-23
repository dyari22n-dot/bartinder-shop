import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

async function removeDarkBackground(input, output, { threshold = 42, feather = 72 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum <= threshold) {
      data[i + 3] = 0;
    } else if (lum < feather) {
      const t = (lum - threshold) / (feather - threshold);
      data[i + 3] = Math.min(data[i + 3], Math.round(t * 255));
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, palette: false })
    .toFile(output);
}

async function removeLightBackground(input, output, { threshold = 238, feather = 210 } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum >= threshold) {
      data[i + 3] = 0;
    } else if (lum > feather) {
      const t = (threshold - lum) / (threshold - feather);
      data[i + 3] = Math.min(data[i + 3], Math.round(t * 255));
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, palette: false })
    .toFile(output);
}

await removeDarkBackground(
  path.join(publicDir, "brand-logo-dark.jpg"),
  path.join(publicDir, "brand-logo.png"),
);
await removeLightBackground(
  path.join(publicDir, "brand-logo-light.jpg"),
  path.join(publicDir, "brand-logo-light.png"),
);

console.log("Wrote public/brand-logo.png and public/brand-logo-light.png");