// Single source of truth for placeholder image slots (brief section 11).
// Used by generate-placeholders.mjs (to draw them) and check-placeholders.mjs (to document the
// expected format of the real asset that will replace each one).

export const FORMATS = {
  '4x5': { w: 960, h: 1200, label: '4:5', real: '1600 x 2000 px, WebP ou AVIF, 200 Ko max' },
  '16x9': { w: 1600, h: 900, label: '16:9', real: '2400 x 1350 px, WebP ou AVIF, 250 Ko max' },
  '1x1': { w: 800, h: 800, label: '1:1', real: '192 x 192 px, WebP, 15 Ko max' },
  logo: { w: 160, h: 48, label: '160 x 48', real: 'SVG monochrome 160 x 48, 5 Ko max' },
};

const pad = (n) => String(n).padStart(2, '0');

/** @returns {{file:string, kind:'image'|'portrait'|'avatar'|'logo', format:string, label:string}[]} */
export function buildSlots() {
  const slots = [];
  const image = (file, label, format) => slots.push({ file, kind: 'image', format, label });

  for (let i = 1; i <= 6; i++) {
    const p = `projet-${pad(i)}`;
    const name = `PROJET ${pad(i)}`;
    image(`${p}-couverture-4x5.svg`, `${name} · COUVERTURE · 4:5`, '4x5');
    image(`${p}-hero-16x9.svg`, `${name} · HERO · 16:9`, '16x9');
    image(`${p}-solution-1-4x5.svg`, `${name} · SOLUTION 1 · 4:5`, '4x5');
    image(`${p}-solution-2-4x5.svg`, `${name} · SOLUTION 2 · 4:5`, '4x5');
    image(`${p}-galerie-1-16x9.svg`, `${name} · GALERIE 1 · 16:9`, '16x9');
    image(`${p}-galerie-2-4x5.svg`, `${name} · GALERIE 2 · 4:5`, '4x5');
    image(`${p}-galerie-3-16x9.svg`, `${name} · GALERIE 3 · 16:9`, '16x9');
    image(`${p}-galerie-4-4x5.svg`, `${name} · GALERIE 4 · 4:5`, '4x5');
  }
  for (let i = 1; i <= 4; i++) image(`service-${pad(i)}-4x5.svg`, `SERVICE ${pad(i)} · VISUEL · 4:5`, '4x5');
  image('agence-bureaux-16x9.svg', 'AGENCE · BUREAUX · 16:9', '16x9');
  image('hero-video-poster-16x9.svg', 'VIDÉO HERO · POSTER · 16:9', '16x9');
  for (let i = 1; i <= 4; i++) {
    slots.push({ file: `equipe-${pad(i)}-portrait-4x5.svg`, kind: 'portrait', format: '4x5', label: `ÉQUIPE ${pad(i)} · PORTRAIT · 4:5` });
  }
  for (let i = 1; i <= 3; i++) {
    slots.push({ file: `temoignage-${pad(i)}-portrait-1x1.svg`, kind: 'avatar', format: '1x1', label: `TÉMOIGNAGE ${pad(i)} · PORTRAIT · 1:1` });
  }
  for (let i = 1; i <= 8; i++) {
    slots.push({ file: `client-${pad(i)}-160x48.svg`, kind: 'logo', format: 'logo', label: `LOGO CLIENT ${pad(i)}` });
  }
  return slots;
}

export const ogPages = [
  { key: 'accueil', label: 'ACCUEIL' },
  { key: 'services', label: 'SERVICES' },
  { key: 'realisations', label: 'RÉALISATIONS' },
  { key: 'projet', label: 'PAGE PROJET' },
  { key: 'agence', label: 'AGENCE' },
  { key: 'contact', label: 'CONTACT' },
  { key: 'mentions-legales', label: 'MENTIONS LÉGALES' },
  { key: 'confidentialite', label: 'CONFIDENTIALITÉ' },
  { key: '404', label: '404' },
];

export const OG_REAL = '1200 x 630 px, PNG ou JPG, 300 Ko max';
