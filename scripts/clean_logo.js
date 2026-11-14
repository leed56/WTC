const sharp = require('sharp');
const fs = require('fs');

async function processLogo() {
  const inputPath = 'public/brand/user_uploaded_logo.jpg';
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 3

  const buf = Buffer.from(data);

  function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return [0, 0, 0];
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

  // 1. REMOVE THE BOTTOM-LEFT BLUE STONE
  // The stone is roughly at x: 0..200, y: 780..893
  // Symmetrically copy from the right side (width - 1 - x) with horizontal gradient feathering
  for (let y = 760; y < height; y++) {
    for (let x = 0; x < 240; x++) {
      const mirrorX = width - 1 - x;
      const [mr, mg, mb] = getPixel(mirrorX, y);
      const [origR, origG, origB] = getPixel(x, y);

      // Feather blend between x=160 and x=230
      let t = 1.0;
      if (x > 160) {
        t = (230 - x) / 70;
      }
      if (t < 0) t = 0;
      if (t > 1) t = 1;

      // In the area where the blue stone is, replace with mirrored dark background
      const finalR = mr * t + origR * (1 - t);
      const finalG = mg * t + origG * (1 - t);
      const finalB = mb * t + origB * (1 - t);
      setPixel(x, y, [finalR, finalG, finalB]);
    }
  }

  console.log('Step 1 complete: bottom-left stone removed.');

  // Save intermediate clean base
  await sharp(buf, { raw: { width, height, channels } })
    .toFile('public/brand/step1_no_stone.jpg');

  // 2. EXTRACT WTC LETTERS
  // Let's identify the exact bounding box of WTC:
  // y: 345 to 522, x: 150 to 725
  const wtcTop = 350;
  const wtcBottom = 520;
  const wtcLeft = 140;
  const wtcRight = 730;
  const wtcW = wtcRight - wtcLeft;
  const wtcH = wtcBottom - wtcTop;

  // Extract WTC with an alpha channel:
  // Golden letters have high luminance or gold hue: (r > 60 && g > 45) or (r + g > 110)
  const wtcRgba = Buffer.alloc(wtcW * wtcH * 4);
  const bgRgb = Buffer.alloc(wtcW * wtcH * 3);

  for (let y = 0; y < wtcH; y++) {
    for (let x = 0; x < wtcW; x++) {
      const imgX = wtcLeft + x;
      const imgY = wtcTop + y;
      const [r, g, b] = getPixel(imgX, imgY);

      // Estimate background at this point:
      // Vertical interpolation between y=340 and y=528
      const [topR, topG, topB] = getPixel(imgX, wtcTop - 5);
      const [botR, botG, botB] = getPixel(imgX, wtcBottom + 5);
      const factor = y / wtcH;
      const bgR = topR * (1 - factor) + botR * factor;
      const bgG = topG * (1 - factor) + botG * factor;
      const bgB = topB * (1 - factor) + botB * factor;

      const bgIdx = (y * wtcW + x) * 3;
      bgRgb[bgIdx] = Math.round(bgR);
      bgRgb[bgIdx + 1] = Math.round(bgG);
      bgRgb[bgIdx + 2] = Math.round(bgB);

      // Detect letter pixel vs background
      // Gold letters have significantly higher brightness/gold saturation than dark navy bg
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      const bgBrightness = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

      const rgbaIdx = (y * wtcW + x) * 4;
      wtcRgba[rgbaIdx] = r;
      wtcRgba[rgbaIdx + 1] = g;
      wtcRgba[rgbaIdx + 2] = b;

      // Calculate alpha smoothly
      let diff = brightness - bgBrightness;
      let alpha = 0;
      if (diff > 12) {
        alpha = Math.min(255, Math.max(0, (diff - 12) * 12));
      }
      wtcRgba[rgbaIdx + 3] = alpha;
    }
  }

  // Find exact center of T stem in the extracted WTC:
  // Let's analyze column sum of brightness for T (x from 280 to 420 in local wtc coords)
  let tCols = [];
  for (let x = 280; x < 420; x++) {
    let sum = 0;
    for (let y = 60; y < wtcH - 20; y++) {
      const a = wtcRgba[(y * wtcW + x) * 4 + 3];
      if (a > 120) sum++;
    }
    if (sum > 40) {
      tCols.push(x);
    }
  }
  const originalTLocalCenter = (tCols[0] + tCols[tCols.length - 1]) / 2;
  const originalTGlobalCenter = wtcLeft + originalTLocalCenter;
  console.log('Original T center in image: x =', originalTGlobalCenter);

  // Inpaint the background behind original WTC on buf
  for (let y = 0; y < wtcH; y++) {
    for (let x = 0; x < wtcW; x++) {
      const imgX = wtcLeft + x;
      const imgY = wtcTop + y;
      const bgIdx = (y * wtcW + x) * 3;
      setPixel(imgX, imgY, [bgRgb[bgIdx], bgRgb[bgIdx + 1], bgRgb[bgIdx + 2]]);
    }
  }

  // Now resize WTC to ~86% to make it "a bit smaller"
  const scale = 0.86;
  const newW = Math.round(wtcW * scale);
  const newH = Math.round(wtcH * scale);

  const resizedWtc = await sharp(wtcRgba, { raw: { width: wtcW, height: wtcH, channels: 4 } })
    .resize(newW, newH)
    .toBuffer();

  const newTLocalCenter = originalTLocalCenter * scale;
  // Diamond pointer tip is at x = 426!
  // We want newTLocalCenter + targetLeft = 426
  // => targetLeft = 426 - newTLocalCenter
  const diamondPointerX = 426;
  const targetLeft = Math.round(diamondPointerX - newTLocalCenter);
  // Keep vertical position aligned nicely under the diamond arc (e.g. y = 360)
  const targetTop = 362;

  console.log(`Placing resized WTC (scale: ${scale}): targetLeft=${targetLeft}, targetTop=${targetTop}`);
  console.log(`New T stem center will be at x = ${Math.round(targetLeft + newTLocalCenter)} (matches diamond pointer at ${diamondPointerX})!`);

  // Composite the clean background with the resized, centered WTC
  const cleanBase = await sharp(buf, { raw: { width, height, channels } }).png().toBuffer();

  const compositeWtcPng = await sharp(resizedWtc, { raw: { width: newW, height: newH, channels: 4 } }).png().toBuffer();

  await sharp(cleanBase)
    .composite([
      {
        input: compositeWtcPng,
        left: targetLeft,
        top: targetTop,
      }
    ])
    .png()
    .toFile('public/brand/wtc_logo_clean.png');

  await sharp('public/brand/wtc_logo_clean.png')
    .jpeg({ quality: 96 })
    .toFile('public/brand/wtc_logo.jpeg');

  console.log('Successfully created clean, perfectly aligned WTC Gem Lab logo!');
}

processLogo().catch(console.error);
