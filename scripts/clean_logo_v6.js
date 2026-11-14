const sharp = require('sharp');

async function generateCleanLogoV6() {
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

  // ==========================================================
  // STEP 1: CLEAN THE BOTTOM-LEFT BLUE STONE AND ITS HIGHLIGHTS
  // ==========================================================
  // Sample smoothly from the dark navy right side
  function getBottomBg(x, y) {
    const nx = (x - 426) / 400;
    const ny = (y - 850) / 40;
    const r = Math.max(0, Math.round(1 + 0.5 * ny));
    const g = Math.max(10, Math.round(15 + 4 * (nx * nx) + 3 * ny));
    const b = Math.max(25, Math.round(35 + 8 * (nx * nx) + 7 * ny));
    return [r, g, b];
  }

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
  console.log('✓ Step 1: Bottom-left stone removed cleanly.');

  // ==========================================================
  // STEP 2: EXTRACT WTC LETTERS BEFORE ANY INPAINTING
  // ==========================================================
  const wtcLeft = 145;
  const wtcRight = 726;
  const wtcTop = 358;
  const wtcBottom = 518;
  const wtcW = wtcRight - wtcLeft;
  const wtcH = wtcBottom - wtcTop;

  const wtcRgba = Buffer.alloc(wtcW * wtcH * 4);

  // Background model only used for alpha extraction
  function getModelBg(x, y) {
    const nx = (x - 426) / 360;
    const ny = (y - 440) / 100;
    const r = 1;
    const g = Math.round(3.8 + 8.5 * (nx * nx) + (nx > 0 ? 2.5 * nx : 0) + 1.5 * (ny * ny));
    const b = Math.round(11.2 + 18.0 * (nx * nx) + (nx > 0 ? 5.0 * nx : 0) + 3.0 * (ny * ny));
    return [r, g, b];
  }

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

      if (lumDiff <= 5) {
        wtcRgba[idx] = 0;
        wtcRgba[idx + 1] = 0;
        wtcRgba[idx + 2] = 0;
        wtcRgba[idx + 3] = 0;
      } else {
        const alphaNorm = Math.min(1.0, (lumDiff - 5) / 16.0);
        wtcRgba[idx] = r;
        wtcRgba[idx + 1] = g;
        wtcRgba[idx + 2] = b;
        wtcRgba[idx + 3] = Math.round(alphaNorm * 255);
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
  console.log(`✓ Step 2: Extracted WTC letters. T local center: ${originalTLocalCenter}`);

  // ==========================================================
  // STEP 3: LAPLACIAN HARMONIC INPAINTING OF LETTER PIXELS ONLY
  // ==========================================================
  // Mask only the actual letter pixels + 3px dilation
  const isMask = new Uint8Array(width * height);
  for (let y = 356; y <= 522; y++) {
    for (let x = 140; x <= 720; x++) {
      const [r, g, b] = getPixel(x, y);
      if (r > 25 || g > 20 || (r > 12 && g > 12 && b < 22)) {
        isMask[y * width + x] = 1;
      }
    }
  }

  const dilatedMask = new Uint8Array(width * height);
  for (let y = 354; y <= 524; y++) {
    for (let x = 138; x <= 722; x++) {
      let hit = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (dx*dx + dy*dy <= 9 && isMask[(y + dy) * width + (x + dx)]) {
            hit = 1;
            break;
          }
        }
        if (hit) break;
      }
      dilatedMask[y * width + x] = hit;
    }
  }

  // Initialize masked pixels with initial smooth model background
  const gridR = new Float32Array(width * height);
  const gridG = new Float32Array(width * height);
  const gridB = new Float32Array(width * height);

  for (let y = 350; y <= 528; y++) {
    for (let x = 135; x <= 725; x++) {
      const idx = y * width + x;
      if (dilatedMask[idx]) {
        const [bgR, bgG, bgB] = getModelBg(x, y);
        gridR[idx] = bgR;
        gridG[idx] = bgG;
        gridB[idx] = bgB;
      } else {
        const [r, g, b] = getPixel(x, y);
        gridR[idx] = r;
        gridG[idx] = g;
        gridB[idx] = b;
      }
    }
  }

  // Run 150 iterations of Laplacian relaxation on masked pixels
  for (let iter = 0; iter < 150; iter++) {
    for (let y = 354; y <= 524; y++) {
      for (let x = 138; x <= 722; x++) {
        const idx = y * width + x;
        if (dilatedMask[idx]) {
          gridR[idx] = 0.25 * (gridR[idx - 1] + gridR[idx + 1] + gridR[idx - width] + gridR[idx + width]);
          gridG[idx] = 0.25 * (gridG[idx - 1] + gridG[idx + 1] + gridG[idx - width] + gridG[idx + width]);
          gridB[idx] = 0.25 * (gridB[idx - 1] + gridB[idx + 1] + gridB[idx - width] + gridB[idx + width]);
        }
      }
    }
  }

  // Write back inpainted values only for masked pixels!
  // All other background pixels remain 100% UNTOUCHED!
  for (let y = 354; y <= 524; y++) {
    for (let x = 138; x <= 722; x++) {
      const idx = y * width + x;
      if (dilatedMask[idx]) {
        setPixel(x, y, [gridR[idx], gridG[idx], gridB[idx]]);
      }
    }
  }
  console.log('✓ Step 3: Laplacian harmonic inpainting of letter strokes complete (ZERO rectangle boxes).');

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
  const targetTop = 368;

  console.log(`✓ Step 4: Resized WTC to ${newW}x${newH} (${Math.round(scale * 100)}%).`);
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

  await sharp('public/brand/wtc_logo_clean.png')
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
    .toFile('public/brand/wtc_logo.jpeg');

  console.log('✓ Successfully created public/brand/wtc_logo_clean.png and public/brand/wtc_logo.jpeg!');
}

generateCleanLogoV6().catch(console.error);
