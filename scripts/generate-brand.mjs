// Generates the brand assets that are code-made rather than hand-drawn:
//  - public/textures/grain.svg (film grain, feTurbulence)
//  - public/scene/fragment-flamme.svg + fragment-flamme-alpha.svg (placeholder fragment)
//  - public/brand/favicon.svg + PNG 32 / 180 / 512 (icon variant "b.")
// Usage: npm run brand:generate   (PREVIEW_DIR=<dir> also writes a preview PNG of the fragment)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { buildFlameAlphaSvg, buildFlameSvg, FLAME_H, FLAME_W } from './lib/flame.mjs';
import { fonts, textPath } from './lib/text.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (...p) => join(root, 'public', ...p);
for (const dir of ['textures', 'scene', 'brand']) mkdirSync(out(dir), { recursive: true });

// --- Grain -----------------------------------------------------------------
const grain = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <filter id="n" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="256" height="256" filter="url(#n)"/>
</svg>
`;
writeFileSync(out('textures', 'grain.svg'), grain);

// --- Fragment ----------------------------------------------------------------
const fragmentSvg = buildFlameSvg();
writeFileSync(out('scene', 'fragment-flamme.svg'), fragmentSvg);
writeFileSync(out('scene', 'fragment-flamme-alpha.svg'), buildFlameAlphaSvg());

if (process.env.PREVIEW_DIR) {
  mkdirSync(process.env.PREVIEW_DIR, { recursive: true });
  const W = 1000;
  const H = 1000;
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="c" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="scale(700 800)">
        <stop offset="0" stop-color="#4c78a8" stop-opacity=".95"/><stop offset=".3" stop-color="#2f4670" stop-opacity=".7"/>
        <stop offset=".55" stop-color="#1b2733" stop-opacity=".3"/><stop offset=".72" stop-color="#1b2733" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="w" gradientUnits="userSpaceOnUse" cx="${W}" cy="${H}" r="1" gradientTransform="translate(${W} ${H}) scale(700 800) translate(${-W} ${-H})">
        <stop offset="0" stop-color="#f05a1c" stop-opacity=".95"/><stop offset=".3" stop-color="#d64e1e" stop-opacity=".6"/>
        <stop offset=".55" stop-color="#6e230f" stop-opacity=".25"/><stop offset=".72" stop-color="#6e230f" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#0e0b0a"/><rect width="${W}" height="${H}" fill="url(#c)"/><rect width="${W}" height="${H}" fill="url(#w)"/>
  </svg>`;
  const frag = await sharp(Buffer.from(fragmentSvg)).resize({ height: 820 }).png().toBuffer();
  const fragMeta = await sharp(frag).metadata();
  await sharp(Buffer.from(bg))
    .composite([{ input: frag, left: -Math.round((fragMeta.width ?? 0) * 0.18), top: H - (fragMeta.height ?? 0) }])
    .png()
    .toFile(join(process.env.PREVIEW_DIR, 'fragment-preview.png'));
  await sharp(Buffer.from(buildFlameAlphaSvg())).resize({ height: 400 }).flatten({ background: '#000' }).png().toFile(join(process.env.PREVIEW_DIR, 'fragment-alpha-preview.png'));
}

// --- Favicon (icon variant: "b." with a flame dot) --------------------------
const bodoni = fonts.bodoni500();
const size = 58;
const probe = textPath(bodoni, 'b.', { size, x: 0, y: 0 });
const cx = (probe.bbox.x1 + probe.bbox.x2) / 2;
const cy = (probe.bbox.y1 + probe.bbox.y2) / 2;
const icon = textPath(bodoni, 'b.', { size, x: 32 - cx, y: 32 - cy });
const [bPart, dotPart] = icon.parts;
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0e0b0a"/>
  <path d="${bPart.d}" fill="#f6eee3"/>
  <path d="${dotPart.d}" fill="#f05a1c"/>
</svg>
`;
writeFileSync(out('brand', 'favicon.svg'), faviconSvg);
for (const [name, px] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-512.png', 512],
]) {
  await sharp(Buffer.from(faviconSvg), { density: Math.max(72, (px / 64) * 72) })
    .resize(px, px)
    .png()
    .toFile(out('brand', name));
}

console.log(`brand assets written (fragment ${FLAME_W}x${FLAME_H}, favicon set, grain)`);
