const sharp = require('sharp');

async function generateCleanLogoV8() {
  // Start from our clean v7 image (which already has WTC scaled to 75%, T centered under the diamond pointer at x=426, and all seams removed)
  const inputPath = 'public/brand/wtc_logo_clean.png';
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;   // 838
  const height = info.height; // 893
  const channels = info.channels; // 3

  const buf = Buffer.from(data);

  function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return [0, 5, 15];
    const idx = (y * width + x) * channels;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  function setPixel(x, y, rgb) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * channels;
    buf[idx] = Math.round(Math.max(0, Math.min(255, rgb[0])));
    buf[idx + 1] = Math.round(Math.max(0, Math.min(255, rgb[1])));
    buf[idx + 2] = Math.round(Math.max(0, Math.min(255, rgb[2])));
  }

  // GEMOLOGICAL LABORATORY ends at y = 695.
  // Erase "International Standards. Trusted Certainty." below y = 715 completely!
  // Fill the bottom region (y >= 710) with clean smooth dark navy studio gradient
  for (let y = 710; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x - 426) / 400;
      const ny = (y - 710) / 180;
      // Smooth gradient matching the studio floor
      const r = 1;
      const g = Math.round(7 + 5 * (nx * nx) + 3 * ny);
      const b = Math.round(18 + 12 * (nx * nx) + 8 * ny);

      // Feather over y = 710..725
      if (y < 725) {
        const [origR, origG, origB] = getPixel(x, y);
        const t = (y - 710) / 15;
        const p = t * t * (3 - 2 * t);
        setPixel(x, y, [
          origR * (1 - p) + r * p,
          origG * (1 - p) + g * p,
          origB * (1 - p) + b * p
        ]);
      } else {
        setPixel(x, y, [r, g, b]);
      }
    }
  }

  const cleanFullPng = await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  // 1. Full height version with clean dark bottom (no bottom text, no stone)
  await sharp(cleanFullPng)
    .png()
    .toFile('public/brand/wtc_logo_clean.png');

  await sharp(cleanFullPng)
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
    .toFile('public/brand/wtc_logo.jpeg');

  // 2. Also create a balanced cropped version ending at y = 735 (40px padding below GEMOLOGICAL LABORATORY)
  // From y = 45 to y = 735 (height = 690)
  await sharp(cleanFullPng)
    .extract({ left: 0, top: 45, width: 838, height: 690 })
    .png()
    .toFile('public/brand/wtc_logo_focused.png');

  console.log('✓ Successfully created clean logos containing ONLY: WTC, GEM LAB, and — GEMOLOGICAL LABORATORY —');
}

generateCleanLogoV8().catch(console.error);
