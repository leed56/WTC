const sharp = require('sharp');

async function generateCleanLogoV5() {
  const inputPath = 'public/brand/user_uploaded_logo.jpg';
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

  // Precise mathematical background model for the central WTC zone
  function getModelBg(x, y) {
    const nx = (x - 426) / 360;
    const ny = (y - 440) / 100;
    const r = Math.max(0, Math.min(2, Math.round(1 - 0.5 * (ny * ny))));
    const g = Math.max(2, Math.round(3.8 + 8.5 * (nx * nx) + (nx > 0 ? 2.5 * nx : 0) + 1.5 * (ny * ny)));
    const b = Math.max(8, Math.round(11.2 + 18.0 * (nx * nx) + (nx > 0 ? 5.0 * nx : 0) + 3.0 * (ny * ny)));
    return [r, g, b];
  }

  // Precise background model for bottom area
  function getBottomBg(x, y) {
    const nx = (x - 426) / 400;
    const ny = (y - 850) / 40;
    const r = Math.max(0, Math.round(1 + 0.5 * ny));
    const g = Math.max(10, Math.round(15 + 4 * (nx * nx) + 3 * ny));
    const b = Math.max(25, Math.round(35 + 8 * (nx * nx) + 7 * ny));
    return [r, g, b];
  }

  // ==========================================================
  // STEP 1: CLEAN THE BOTTOM-LEFT BLUE STONE AND ITS HIGHLIGHTS
  // ==========================================================
  // In the bottom-left, the stone and its glow exist at:
  // For y in 770..860: x < 170 (text starts at x >= 264)
  // For y in 860..893: x < 255 (text ended at y=859)
  for (let y = 770; y < height; y++) {
    const maxX = y >= 860 ? 255 : 170;
    const featherStart = y >= 860 ? 210 : 130;
    for (let x = 0; x <= maxX; x++) {
      const [bgR, bgG, bgB] = getBottomBg(x, y);
      const [origR, origG, origB] = getPixel(x, y);

      let blend = 1.0;
      if (x > featherStart) {
        const p = (maxX - x) / (maxX - featherStart);
        blend = p * p * (3 - 2 * p);
      }

      setPixel(x, y, [
        bgR * blend + origR * (1 - blend),
        bgG * blend + origG * (1 - blend),
        bgB * blend + origB * (1 - blend)
      ]);
    }
  }
  console.log('✓ Bottom-left stone and all facet highlights completely removed.');

  // ==========================================================
  // STEP 2: EXTRACT WTC LETTERS WITH PROPER ALPHA UN-PREMULTIPLICATION
  // ==========================================================
  const wtcLeft = 145;
  const wtcRight = 726;
  const wtcTop = 358;
  const wtcBottom = 518;
  const wtcW = wtcRight - wtcLeft;
  const wtcH = wtcBottom - wtcTop;

  const wtcRgba = Buffer.alloc(wtcW * wtcH * 4);

  for (let y = 0; y < wtcH; y++) {
    for (let x = 0; x < wtcW; x++) {
      const gx = wtcLeft + x;
      const gy = wtcTop + y;
      const [r, g, b] = getPixel(gx, gy);
      const [bgR, bgG, bgB] = getModelBg(gx, gy);

      const diffR = r - bgR;
      const diffG = g - bgG;
      const diffB = b - bgB;
      const lumDiff = 0.35 * diffR + 0.45 * diffG + 0.20 * diffB;

      const idx = (y * wtcW + x) * 4;

      if (lumDiff <= 4) {
        wtcRgba[idx] = 0;
        wtcRgba[idx + 1] = 0;
        wtcRgba[idx + 2] = 0;
        wtcRgba[idx + 3] = 0;
      } else {
        const alphaNorm = Math.min(1.0, (lumDiff - 4) / 18.0);
        const alphaByte = Math.round(alphaNorm * 255);

        // Un-premultiply background to preserve pure 3D gold color
        const unR = Math.max(0, Math.min(255, Math.round((r - bgR * (1 - alphaNorm)) / Math.max(0.1, alphaNorm))));
        const unG = Math.max(0, Math.min(255, Math.round((g - bgG * (1 - alphaNorm)) / Math.max(0.1, alphaNorm))));
        const unB = Math.max(0, Math.min(255, Math.round((b - bgB * (1 - alphaNorm)) / Math.max(0.1, alphaNorm))));

        wtcRgba[idx] = unR;
        wtcRgba[idx + 1] = unG;
        wtcRgba[idx + 2] = unB;
        wtcRgba[idx + 3] = alphaByte;
      }
    }
  }

  // Find exact T vertical stem center in local coordinates
  let tCols = [];
  for (let x = 300; x < 400; x++) {
    let count = 0;
    for (let y = 50; y < wtcH - 20; y++) {
      const idx = (y * wtcW + x) * 4;
      if (wtcRgba[idx + 3] > 180 && wtcRgba[idx] > 100) {
        count++;
      }
    }
    if (count > 40) tCols.push(x);
  }
  const originalTLocalCenter = (tCols[0] + tCols[tCols.length - 1]) / 2;
  console.log(`✓ Original T local center in crop: ${originalTLocalCenter} (Global: ${wtcLeft + originalTLocalCenter})`);

  // ==========================================================
  // STEP 3: SEAMLESS INPAINT OF ORIGINAL WTC CANVAS ZONE
  // ==========================================================
  // Replace the canvas in the WTC zone [135..735, 356..518] with the clean model background
  // and smoothly feather the perimeter by 10 pixels for zero edge artifacts
  const feather = 10;
  for (let y = wtcTop - 2; y <= wtcBottom + 2; y++) {
    for (let x = wtcLeft - 10; x <= wtcRight + 10; x++) {
      const [bgR, bgG, bgB] = getModelBg(x, y);
      const [origR, origG, origB] = getPixel(x, y);

      // Distance to perimeter
      const distLeft = x - (wtcLeft - 10);
      const distRight = (wtcRight + 10) - x;
      const distTop = y - (wtcTop - 2);
      const distBottom = (wtcBottom + 2) - y;
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      let blend = 1.0;
      if (minDist < feather) {
        const p = minDist / feather;
        blend = p * p * (3 - 2 * p);
      }

      setPixel(x, y, [
        bgR * blend + origR * (1 - blend),
        bgG * blend + origG * (1 - blend),
        bgB * blend + origB * (1 - blend)
      ]);
    }
  }
  console.log('✓ Seamless feathered inpaint of WTC background canvas complete.');

  // ==========================================================
  // STEP 4: SCALE DOWN WTC ("bit smaller" ~84%) & ALIGN T UNDER CULET
  // ==========================================================
  const scale = 0.84;
  const newW = Math.round(wtcW * scale);
  const newH = Math.round(wtcH * scale);

  const resizedWtcBuffer = await sharp(wtcRgba, { raw: { width: wtcW, height: wtcH, channels: 4 } })
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const diamondCuletX = 426; // Apex culet tip of diamond
  const newTLocalCenter = originalTLocalCenter * scale;
  const targetLeft = Math.round(diamondCuletX - newTLocalCenter);
  // Vertically centered between arch and GEM LAB
  const targetTop = 368;

  console.log(`✓ Resized WTC to ${newW}x${newH} (${Math.round(scale * 100)}%).`);
  console.log(`✓ Placement: left=${targetLeft}, top=${targetTop}`);
  console.log(`✓ T stem global center = ${Math.round(targetLeft + newTLocalCenter)} (Diamond culet is at ${diamondCuletX}) -> 100% PERFECTLY ALIGNED!`);

  // ==========================================================
  // STEP 5: COMPOSITE FINAL CLEAN LOGO
  // ==========================================================
  const cleanBasePng = await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  await sharp(cleanBasePng)
    .composite([
      {
        input: resizedWtcBuffer,
        left: targetLeft,
        top: targetTop,
      }
    ])
    .png()
    .toFile('public/brand/wtc_logo_clean.png');

  // Also write high-res JPEG
  await sharp('public/brand/wtc_logo_clean.png')
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
    .toFile('public/brand/wtc_logo.jpeg');

  console.log('✓ Successfully created public/brand/wtc_logo_clean.png and public/brand/wtc_logo.jpeg!');
}

generateCleanLogoV5().catch(console.error);
