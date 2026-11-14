const sharp = require('sharp');

async function generateCleanLogoV4() {
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
  // STEP 1: CLEAN THE BOTTOM-LEFT BLUE STONE FACET
  // ==========================================================
  // Stone facet is strictly at x <= 185, y >= 770
  // Clean right edge: x in [740..830] has NO text (text ends at x <= 618)
  for (let y = 770; y < height; y++) {
    for (let x = 0; x <= 190; x++) {
      // Sample cleanly from the dark right side
      const sampleX = Math.round(835 - (x / 190) * 80); // between 835 and 755
      const [sr, sg, sb] = getPixel(sampleX, y);
      const [origR, origG, origB] = getPixel(x, y);

      let blend = 1.0;
      if (x > 140) {
        // Smooth hermite ease out to preserve existing background towards x=190
        const p = (190 - x) / 50; // 1 down to 0
        blend = p * p * (3 - 2 * p);
      }

      setPixel(x, y, [
        sr * blend + origR * (1 - blend),
        sg * blend + origG * (1 - blend),
        sb * blend + origB * (1 - blend)
      ]);
    }
  }
  console.log('✓ Bottom-left stone removed cleanly using clean right-edge background.');

  // ==========================================================
  // STEP 2: EXTRACT WTC LETTERS
  // ==========================================================
  // WTC is strictly in y: 358..518, x: 145..726
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

      // Interpolated background color for this exact column & row
      const t = y / (wtcH - 1);
      const [tr, tg, tb] = getPixel(gx, wtcTop - 2);
      const [br, bg, bb] = getPixel(gx, wtcBottom + 2);
      const expBgR = tr * (1 - t) + br * t;
      const expBgG = tg * (1 - t) + bg * t;
      const expBgB = tb * (1 - t) + bb * t;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const bgLum = 0.299 * expBgR + 0.587 * expBgG + 0.114 * expBgB;

      const idx = (y * wtcW + x) * 4;
      wtcRgba[idx] = r;
      wtcRgba[idx + 1] = g;
      wtcRgba[idx + 2] = b;

      const diff = lum - bgLum;
      let alpha = 0;
      if (diff > 6) {
        alpha = Math.min(255, Math.max(0, (diff - 6) * 9.0));
      }
      wtcRgba[idx + 3] = alpha;
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
  // STEP 3: SEAMLESS COLUMN-INTERPOLATED INPAINT OF OLD WTC
  // ==========================================================
  // Fill y: wtcTop..wtcBottom for x: wtcLeft-5..wtcRight+5
  // by vertical linear interpolation between the true pixels at (x, wtcTop-2) and (x, wtcBottom+2)
  for (let x = wtcLeft - 5; x <= wtcRight + 5; x++) {
    const [tr, tg, tb] = getPixel(x, wtcTop - 2);
    // For bottom: G in GEM LAB starts at x=90..118 at y=522; at x >= 120, row 520 is clean
    const yBot = 520;
    const [br, bg, bb] = getPixel(x, yBot);

    for (let y = wtcTop; y <= wtcBottom; y++) {
      const t = (y - wtcTop) / (wtcBottom - wtcTop);
      const r = tr * (1 - t) + br * t;
      const g = tg * (1 - t) + bg * t;
      const b = tb * (1 - t) + bb * t;
      setPixel(x, y, [r, g, b]);
    }
  }
  console.log('✓ Seamless column-interpolated background fill completed.');

  // ==========================================================
  // STEP 4: SCALE DOWN WTC ("bit smaller" ~84%) & ALIGN T UNDER CULET
  // ==========================================================
  const scale = 0.84; // Bit smaller
  const newW = Math.round(wtcW * scale);
  const newH = Math.round(wtcH * scale);

  const resizedWtcBuffer = await sharp(wtcRgba, { raw: { width: wtcW, height: wtcH, channels: 4 } })
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const diamondCuletX = 426; // Apex culet tip of diamond
  const newTLocalCenter = originalTLocalCenter * scale;
  const targetLeft = Math.round(diamondCuletX - newTLocalCenter);
  // Vertically centered in the zone between 358 and 518
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

generateCleanLogoV4().catch(console.error);
