// Generates every placeholder image of the site (brief section 11):
//  - public/placeholders/*.svg : project, service, agency, portrait and client logo slots
//  - public/og/<page>.png      : one 1200 x 630 Open Graph image per page
// Slots come from scripts/lib/slots.mjs. Text is converted to outlines, so the files render the
// same everywhere. Usage: npm run placeholders:generate
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { FORMATS, buildSlots, ogPages } from './lib/slots.mjs';
import { fonts, round, textPath } from './lib/text.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'placeholders');
const ogDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });
mkdirSync(ogDir, { recursive: true });

const label600 = fonts.instrument600();
const label400 = fonts.instrument400();
const bodoni = fonts.bodoni500();

// Brand glows on charbon, same stops as the Ambiance CSS (titane top left, flamme bottom right).
const glows = (w, h) => `
  <defs>
    <radialGradient id="cool" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="scale(${round(0.7 * w)} ${round(0.8 * h)})">
      <stop offset="0" stop-color="#4c78a8" stop-opacity=".95"/>
      <stop offset=".3" stop-color="#2f4670" stop-opacity=".7"/>
      <stop offset=".55" stop-color="#1b2733" stop-opacity=".3"/>
      <stop offset=".72" stop-color="#1b2733" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate(${w} ${h}) scale(${round(0.7 * w)} ${round(0.8 * h)})">
      <stop offset="0" stop-color="#f05a1c" stop-opacity=".95"/>
      <stop offset=".3" stop-color="#d64e1e" stop-opacity=".6"/>
      <stop offset=".55" stop-color="#6e230f" stop-opacity=".25"/>
      <stop offset=".72" stop-color="#6e230f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0e0b0a"/>
  <rect width="${w}" height="${h}" fill="url(#cool)"/>
  <rect width="${w}" height="${h}" fill="url(#warm)"/>`;

const FONT_SIZE = { '4x5': 24, '16x9': 30, '1x1': 22 };

function labelPath(text, w, h, size) {
  const t = textPath(label600, text, { size, x: w / 2, y: h / 2 + size * 0.36, tracking: 0.22, anchor: 'middle' });
  return `<path d="${t.d}" fill="#9db3c6"/>`;
}

function imageSvg(slot) {
  const f = FORMATS[slot.format];
  const { w, h } = f;
  const inset = Math.round(w * 0.025);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Placeholder ${slot.label}">${glows(w, h)}
  <path d="M0 0L${w} ${h}M${w} 0L0 ${h}" stroke="#9db3c6" stroke-opacity=".1" stroke-width="2" fill="none"/>
  <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="none" stroke="#9db3c6" stroke-opacity=".16" stroke-width="2"/>
  ${labelPath(slot.label, w, h, FONT_SIZE[slot.format])}
</svg>
`;
}

// Sober silhouette on cendre (portraits and testimonial photos)
function portraitSvg(slot) {
  const { w, h } = FORMATS[slot.format];
  const cx = w / 2;
  const headR = w * 0.15;
  const headY = h * 0.38;
  const shoulderTop = h * 0.64;
  const shoulders = `M${round(w * 0.14)} ${h}C${round(w * 0.14)} ${round(h * 0.78)} ${round(w * 0.3)} ${round(shoulderTop)} ${cx} ${round(shoulderTop)}C${round(w * 0.7)} ${round(shoulderTop)} ${round(w * 0.86)} ${round(h * 0.78)} ${round(w * 0.86)} ${h}Z`;
  const showLabel = slot.kind === 'portrait';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Placeholder ${slot.label}">
  <rect width="${w}" height="${h}" fill="#2a2421"/>
  <circle cx="${cx}" cy="${round(headY)}" r="${round(headR)}" fill="#9db3c6" fill-opacity=".24"/>
  <path d="${shoulders}" fill="#9db3c6" fill-opacity=".24"/>
  ${showLabel ? labelPath(slot.label, w, h * 1.9, 18) : ''}
</svg>
`;
}

// "LOGO CLIENT 01" in ivoire, 160 x 48, transparent background
function logoSvg(slot) {
  const { w, h } = FORMATS.logo;
  let size = 13;
  let t = textPath(label600, slot.label, { size, x: w / 2, y: h / 2 + size * 0.36, tracking: 0.1, anchor: 'middle' });
  if (t.width > w - 12) {
    size = Math.floor((size * (w - 12)) / t.width);
    t = textPath(label600, slot.label, { size, x: w / 2, y: h / 2 + size * 0.36, tracking: 0.1, anchor: 'middle' });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${slot.label}">
  <path d="${t.d}" fill="#f6eee3"/>
</svg>
`;
}

for (const slot of buildSlots()) {
  const svg = slot.kind === 'logo' ? logoSvg(slot) : slot.kind === 'image' ? imageSvg(slot) : portraitSvg(slot);
  writeFileSync(join(outDir, slot.file), svg);
}

// --- Open Graph placeholders (1200 x 630) -----------------------------------------------------
const OG_W = 1200;
const OG_H = 630;
const ogHashes = {};
for (const page of ogPages) {
  const logo = textPath(bodoni, 'blue.ember', { size: 132, x: OG_W / 2 - 20, y: 330, anchor: 'middle' });
  const dotIndex = 'blue.ember'.indexOf('.');
  const agency = textPath(label400, 'agency', { size: 28, x: logo.x + logo.width, y: 380, tracking: 0.55, anchor: 'end' });
  const tag = textPath(label600, `OG · ${page.label} · 1200 × 630`, { size: 18, x: 64, y: OG_H - 56, tracking: 0.22 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_W} ${OG_H}" width="${OG_W}" height="${OG_H}">${glows(OG_W, OG_H)}
  ${logo.parts.map((p, i) => `<path d="${p.d}" fill="${i === dotIndex ? '#f05a1c' : '#f6eee3'}"/>`).join('')}
  <path d="${agency.d}" fill="#f6eee3"/>
  <path d="${tag.d}" fill="#9db3c6"/>
</svg>`;
  const target = join(ogDir, `${page.key}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(target);
  ogHashes[page.key] = createHash('sha1').update(readFileSync(target)).digest('hex');
}
// Lets check-placeholders tell a generated OG image from a real one that replaced it
writeFileSync(join(root, 'scripts', '.og-placeholders.json'), `${JSON.stringify(ogHashes, null, 2)}\n`);

console.log(`placeholders written: ${buildSlots().length} SVG + ${ogPages.length} OG images`);
