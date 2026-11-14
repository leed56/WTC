const sharp = require('sharp');

async function cleanAndAlignLogo() {
  const inputPath = 'public/brand/user_uploaded_logo.jpg';
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const buf = Buffer.from(data);

  function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return [0, 5, 15];
    const idx = (y * width + x) * channels;
    return [buf[idx], buf[idx + 1], buf[idx + 2]];
  }

  function setPixel(x, y, rgb) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * channels;
    buf[idx] = Math.round(rgb[0]);
    buf[idx + 1] = Math.round(rgb[1]);
    buf[idx + 2] = Math.round(rgb[2]);
  }

  // ==========================================================
  // 1. CLEAN THE BOTTOM-LEFT BLUE STONE (x: 0..165, y: 825..893)
  // ==========================================================
  // Symmetrically copy from the right side x: (width - 1 - x), which is pure dark navy
  for (let y = 825; y < height; y++) {
    for (let x = 0; x < 165; x++) {
      // Clean sample from x = 670 to 838 at the same y
      const sampleX = width - 1 - x;
      const [sr, sg, sb] = getPixel(sampleX, y);
      const [origR, origG, origB] = getPixel(x, y);

      let t = 1.0;
      if (x > 140) {
        t = (165 - x) / 25;
      }
      setPixel(x, y, [
        sr * t + origR * (1 - t),
        sg * t + origG * (1 - t),
        sb * t + origB * (1 - t)
      ]);
    }
  }
  console.log('1. Bottom-left stone successfully removed.');

  // ==========================================================
  // 2. EXTRACT WTC LETTERS WITH HIGH-QUALITY ALPHA MASK
  // ==========================================================
  const wtcTop = 352;
  const wtcBottom = 516;
  const wtcLeft = 148;
  const wtcRight = 724;
  const wtcW = wtcRight - wtcLeft;
  const wtcH = wtcBottom - wtcTop;

  // Background color model in the WTC zone:
  // Center (426, 435) has subtle dark blue glow [3, 16, 38], edges are [1, 6, 20]
  function getModelBg(x, y) {
    const dx = (x - 426) / 300;
    const dy = (y - 435) / 90;
    const distSq = dx * dx + dy * dy;
    const factor = Math.max(0, 1 - distSq * 0.5);
    const r = 1 + 2 * factor;
    const g = 6 + 10 * factor;
    const b = 20 + 18 * factor;
    return [r, g, b];
  }

  const wtcRgba = Buffer.alloc(wtcW * wtcH * 4);

  // Analyze and extract gold letters
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
      if (diff > 8) {
        // Smooth anti-aliased feather
        alpha = Math.min(255, Math.max(0, (diff - 8) * 9));
      }
      wtcRgba[idx + 3] = alpha;
    }
  }

  // Find exact T center in local coordinates
  let tCols = [];
  for (let x = 280; x < 420; x++) {
    let sum = 0;
    for (let y = 50; y < wtcH - 20; y++) {
      if (wtcRgba[(y * wtcW + x) * 4 + 3] > 120) sum++;
    }
    if (sum > 40) tCols.push(x);
  }
  const originalTLocalCenter = (tCols[0] + tCols[tCols.length - 1]) / 2;
  console.log('Original T local center in WTC block:', originalTLocalCenter);

  // ==========================================================
  // 3. CLEAN THE WTC BACKGROUND CANVAS
  // ==========================================================
  // Fill the region where the old letters were with the seamless background model
  for (let y = wtcTop - 2; y <= wtcBottom + 2; y++) {
    for (let x = wtcLeft - 10; x <= wtcRight + 10; x++) {
      const [br, bg, bb] = getModelBg(x, y);
      setPixel(x, y, [br, bg, bb]);
    }
  }

  // ==========================================================
  // 4. SCALE DOWN WTC ("bit smaller" ~85%) & CENTER T AT x = 426
  // ==========================================================
  const scale = 0.85; // makes WTC a bit smaller, beautifully proportioned to GEM LAB
  const newW = Math.round(wtcW * scale);
  const newH = Math.round(wtcH * scale);

  const resizedWtcBuffer = await sharp(wtcRgba, { raw: { width: wtcW, height: wtcH, channels: 4 } })
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const diamondPointerX = 426; // The exact culet tip of the diamond
  const newTLocalCenter = originalTLocalCenter * scale;
  const targetLeft = Math.round(diamondPointerX - newTLocalCenter);
  const targetTop = 368; // Centered vertically between diamond arc and GEM LAB

  console.log(`2. Resized WTC to ${newW}x${newH} (${Math.round(scale * 100)}%).`);
  console.log(`3. Target placement: left=${targetLeft}, top=${targetTop}`);
  console.log(`   Resulting T stem center = ${Math.round(targetLeft + newTLocalCenter)} (Diamond pointer is at ${diamondPointerX}) -> PERFECT ALIGNMENT!`);

  // ==========================================================
  // 5. COMPOSITE FINAL LOGO
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

  // Also update wtc_logo.jpeg
  await sharp('public/brand/wtc_logo_clean.png')
    .jpeg({ quality: 98 })
    .toFile('public/brand/wtc_logo.jpeg');

  console.log('Done! Created public/brand/wtc_logo_clean.png and public/brand/wtc_logo.jpeg');
}

cleanAndAlignLogo().catch(console.error);
