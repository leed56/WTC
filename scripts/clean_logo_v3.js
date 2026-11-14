const sharp = require('sharp');
const fs = require('fs');

async function generateCleanLogoV3() {
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

  // Background color model across the WTC zone
  function getModelBg(x, y) {
    const dx = (x - 426) / 380;
    const dy = (y - 440) / 100;
    const r = Math.max(0, Math.min(2, Math.round(1 - 0.5 * (dy * dy))));
    const g = Math.max(2, Math.round(3 + 8 * (dx * dx) + 2 * (dy * dy)));
    const b = Math.max(8, Math.round(10 + 17 * (dx * dx) + 4 * (dy * dy)));
    return [r, g, b];
  }

  // ==========================================================
  // STEP 1: CLEAN THE BOTTOM-LEFT BLUE STONE FACET
  // ==========================================================
  // Bottom left stone facet is strictly in x < 210, y in 700..893
  // Symmetrically copy from the pristine right side: width - 1 - x
  // Ease smoothly between x = 160 and 220 into the original background
  for (let y = 700; y < height; y++) {
    for (let x = 0; x < 220; x++) {
      const sampleX = width - 1 - x;
      const [sr, sg, sb] = getPixel(sampleX, y);
      const [origR, origG, origB] = getPixel(x, y);

      let blendFactor = 1.0;
      if (x > 150) {
        // Smooth hermite ease out
        const p = (220 - x) / 70; // 1 down to 0
        blendFactor = p * p * (3 - 2 * p);
      }

      setPixel(x, y, [
        sr * blendFactor + origR * (1 - blendFactor),
        sg * blendFactor + origG * (1 - blendFactor),
        sb * blendFactor + origB * (1 - blendFactor)
      ]);
    }
  }
  console.log('✓ Bottom-left blue stone completely removed and smoothly blended.');

  // ==========================================================
  // STEP 2: EXTRACT WTC LETTERS WITH FEATHERED ALPHA
  // ==========================================================
  const wtcLeft = 145;
  const wtcRight = 726;
  const wtcTop = 356;
  const wtcBottom = 542;
  const wtcW = wtcRight - wtcLeft;
  const wtcH = wtcBottom - wtcTop;

  const wtcRgba = Buffer.alloc(wtcW * wtcH * 4);

  for (let y = 0; y < wtcH; y++) {
    for (let x = 0; x < wtcW; x++) {
      const gx = wtcLeft + x;
      const gy = wtcTop + y;
      const [r, g, b] = getPixel(gx, gy);
      const [br, bg, bb] = getModelBg(gx, gy);

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const bgLum = 0.299 * br + 0.587 * bg + 0.114 * bb;

      const idx = (y * wtcW + x) * 4;
      wtcRgba[idx] = r;
      wtcRgba[idx + 1] = g;
      wtcRgba[idx + 2] = b;

      const diff = lum - bgLum;
      let alpha = 0;
      if (diff > 5) {
        alpha = Math.min(255, Math.max(0, (diff - 5) * 8.5));
      }
      wtcRgba[idx + 3] = alpha;
    }
  }

  // Find exact T vertical stem center in local coordinates
  let tCols = [];
  for (let x = 300; x < 400; x++) {
    let count = 0;
    for (let y = 60; y < wtcH - 30; y++) {
      const idx = (y * wtcW + x) * 4;
      if (wtcRgba[idx + 3] > 180 && wtcRgba[idx] > 100) {
        count++;
      }
    }
    if (count > 45) tCols.push(x);
  }
  const originalTLocalCenter = (tCols[0] + tCols[tCols.length - 1]) / 2;
  console.log(`✓ Original T local center in crop: ${originalTLocalCenter} (Global: ${wtcLeft + originalTLocalCenter})`);

  // ==========================================================
  // STEP 3: SEAMLESSLY INPAINT THE ORIGINAL WTC ZONE
  // ==========================================================
  // Rather than filling a harsh rectangular box, we smoothly fade out the
  // old letter pixels by blending with getModelBg based on letter alpha,
  // leaving existing pure background untouched!
  for (let y = 0; y < wtcH; y++) {
    for (let x = 0; x < wtcW; x++) {
      const gx = wtcLeft + x;
      const gy = wtcTop + y;
      const idx = (y * wtcW + x) * 4;
      const alpha = wtcRgba[idx + 3] / 255.0;

      const [origR, origG, origB] = getPixel(gx, gy);
      const [bgR, bgG, bgB] = getModelBg(gx, gy);

      // Where alpha was high, replace with bg; where alpha was 0, keep orig (or seamless blend)
      const r = origR * (1 - alpha) + bgR * alpha;
      const g = origG * (1 - alpha) + bgG * alpha;
      const b = origB * (1 - alpha) + bgB * alpha;
      setPixel(gx, gy, [r, g, b]);
    }
  }

  // Apply subtle bilateral smoothing inside the inpaint region to erase any residual edges
  for (let iter = 0; iter < 2; iter++) {
    for (let y = wtcTop + 2; y < wtcBottom - 2; y++) {
      for (let x = wtcLeft + 2; x < wtcRight - 2; x++) {
        const [mR, mG, mB] = getModelBg(x, y);
        const [cR, cG, cB] = getPixel(x, y);
        // Only smooth if it deviates from model bg
        if (Math.abs(cR - mR) > 2 || Math.abs(cG - mG) > 3 || Math.abs(cB - mB) > 4) {
          setPixel(x, y, [mR, mG, mB]);
        }
      }
    }
  }
  console.log('✓ WTC background inpainting complete with seamless edge blending.');

  // ==========================================================
  // STEP 4: SCALE DOWN WTC ("bit smaller" ~84%) & ALIGN T UNDER CULET
  // ==========================================================
  const scale = 0.84; // Refined scaling
  const newW = Math.round(wtcW * scale);
  const newH = Math.round(wtcH * scale);

  const resizedWtcBuffer = await sharp(wtcRgba, { raw: { width: wtcW, height: wtcH, channels: 4 } })
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const diamondCuletX = 426; // Apex culet tip of diamond
  const newTLocalCenter = originalTLocalCenter * scale;
  const targetLeft = Math.round(diamondCuletX - newTLocalCenter);
  // Vertically centered between diamond culet (340) and GEM LAB (525)
  // Distance = 185px. New height = 156px.
  // Top at 340 + (185 - 156)/2 + 2 = 356
  const targetTop = 360;

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

generateCleanLogoV3().catch(console.error);
