// Scans the source for remaining placeholders and regenerates PLACEHOLDERS.md.
//   npm run placeholders:check        scan + write PLACEHOLDERS.md
//   node scripts/check-placeholders.mjs --warn   scan only, one-line console warning (used after `npm run build`)
// A placeholder is a bracketed text with at least two consecutive capitals ([VILLE], [À FOURNIR : ...],
// [+XX %]) or one of the budget ranges ([< 5 k€]). Image placeholders are references to /placeholders/*.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMATS, OG_REAL, buildSlots, ogPages } from './lib/slots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const warnOnly = process.argv.includes('--warn');

const SCAN_DIRS = ['src/config', 'src/content', 'src/pages', 'src/components', 'src/layouts'];
const TEXT_EXT = new Set(['.astro', '.ts', '.md', '.mdx', '.json']);

const BRACKET = /\[(?=[^\]\n]*[A-ZÀ-ÝÉ]{2})[^[\]\n'"`{}()=;]*\]|\[[<>]?\s?\d+(?:\s?à\s?\d+)?\s?k€\]/g;

// What the real content should look like, by placeholder code
const KNOWN = [
  [/^\[VILLE\]$/, "Nom de la ville de l'agence"],
  [/^\[EMAIL\]$/, 'Adresse e-mail de contact'],
  [/^\[EMAIL-DPO\]$/, 'Adresse e-mail du délégué à la protection des données'],
  [/^\[TÉLÉPHONE\]$/, 'Numéro, format international (ex. +33 1 23 45 67 89)'],
  [/^\[ADRESSE\]$/, 'Adresse postale complète'],
  [/^\[(INSTAGRAM|LINKEDIN)\]$/, 'URL complète du profil (https://...)'],
  [/^\[DÉLAI\]$/, 'Durée de réponse (ex. 24 heures ouvrées)'],
  [/^\[CHIFFRE-\d\]$/, 'Nombre seul (ex. 120) : il est compté à l\'apparition'],
  [/^\[INDICATEUR\]$/, "Nom de l'indicateur (ex. chiffre d'affaires)"],
  [/^\[DURÉE\]$/, 'Durée (ex. 6 mois)'],
  [/^\[\+?XX ?%?\]$/, 'Valeur chiffrée du résultat (ex. +45 %)'],
  [/^\[(RAISON SOCIALE|FORME|CAPITAL|SIREN|DIRECTEUR DE PUBLICATION|HÉBERGEUR)\]$/, 'Information légale exacte (Kbis)'],
  [/^\[VIDEO-HERO\]$/, 'Vidéo MP4 H.264 de 6 à 12 s en boucle, 8 Mo max, + version mobile 3 Mo max'],
  [/^\[PROJET \d+\]$/, 'Nom du projet (court)'],
  [/^\[CLIENT \d+\]$/, 'Nom du client'],
  [/^\[ANNÉE\]$/, 'Année de livraison'],
  [/^\[SECTEUR\]$/, "Secteur d'activité du client"],
  [/^\[PRÉNOM NOM( \d+)?\]$/, 'Prénom et nom de la personne'],
  [/^\[FONCTION\]$/, 'Fonction'],
  [/^\[ENTREPRISE\]$/, 'Nom de l\'entreprise'],
  [/^\[RÔLE\]$/, 'Rôle sur le projet'],
  [/^\[TÉMOIGNAGE À FOURNIR\]$/, 'Citation réelle et validée par le client (1 à 3 phrases)'],
  [/^\[RÉSULTAT PRINCIPAL EN UNE PHRASE\]$/, 'Une phrase : le résultat chiffré principal (sert de meta description)'],
  [/^\[DESCRIPTION 2 LIGNES\]$/, 'Description de la carte service, 2 lignes (≈ 90 caractères)'],
  [/^\[(<|>)? ?\d+( à \d+)? k€\]$/, 'Fourchette de budget (libellé de la liste)'],
];

function describe(token) {
  const known = KNOWN.find(([re]) => re.test(token));
  if (known) return known[1];
  const words = token.match(/(\d+)\s*(?:à|À|A)\s*(\d+)\s*mots/i);
  if (words) return `Texte de ${words[1]} à ${words[2]} mots`;
  const single = token.match(/(\d+)\s*mots/i);
  if (single) return `Texte d'environ ${single[1]} mots`;
  if (/2 lignes/i.test(token)) return 'Texte de 2 lignes (≈ 90 caractères)';
  return 'Texte à fournir (voir la description entre crochets)';
}

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (TEXT_EXT.has(full.slice(full.lastIndexOf('.')))) out.push(full);
  }
  return out;
}

const slotsByFile = new Map(buildSlots().map((slot) => [slot.file, slot]));
const textRows = []; // { file, line, token, format }
const assetRows = new Map(); // asset file -> { slot, files:Set }

for (const dir of SCAN_DIRS) {
  for (const file of walk(join(root, dir))) {
    const rel = relative(root, file).split(sep).join('/');
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((text, index) => {
      for (const match of text.matchAll(BRACKET)) {
        textRows.push({ file: rel, line: index + 1, token: match[0], format: describe(match[0]) });
      }
      for (const match of text.matchAll(/\/placeholders\/([\w.-]+\.svg)/g)) {
        const slot = slotsByFile.get(match[1]);
        if (!slot) continue;
        const entry = assetRows.get(match[1]) ?? { slot, files: new Set() };
        entry.files.add(rel);
        assetRows.set(match[1], entry);
      }
    });
  }
}

// Brand and scene assets that stay placeholders until the real file is provided
const brandRows = [];
const exists = (p) => existsSync(join(root, 'public', p));
if (!exists('brand/logo.svg')) {
  brandRows.push(['public/brand/logo.svg', 'Logo SVG (version ivoire pour fond sombre). Optionnel : logo-light.svg (charbon). Remplace le logo typographique.']);
}
// The fragment is optional (fragmentEnabled in src/config/ember.ts). Read as text: this script runs after every build,
// where a TypeScript file cannot always be imported.
const fragmentOn = /export const fragmentEnabled\s*=\s*true/.test(readFileSync(join(root, 'src', 'config', 'ember.ts'), 'utf8'));
if (fragmentOn && !exists('scene/fragment-flamme.webp')) {
  brandRows.push(['public/scene/fragment-flamme.webp', 'Rendu 3D (Blender) de la flamme en bas-relief, WebP avec transparence, ratio 3:4 (ex. 1200 x 1600 px), ≈ 150 Ko, même cadrage que le SVG']);
}
if (!exists('textures/ember-cracks.webp')) {
  brandRows.push(['public/textures/ember-cracks.webp', '(Optionnel) texture de fissures 512 px, moins de 150 Ko : remplace la texture procédurale de la braise']);
}
// OG placeholders are generated files: still placeholders while their hash matches the generated one
const ogRecordPath = join(root, 'scripts', '.og-placeholders.json');
const ogRecord = existsSync(ogRecordPath) ? JSON.parse(readFileSync(ogRecordPath, 'utf8')) : {};
const ogPending = ogPages
  .map(({ key }) => key)
  .filter((key) => {
    const file = join(root, 'public', 'og', `${key}.png`);
    if (!existsSync(file)) return true;
    return createHash('sha1').update(readFileSync(file)).digest('hex') === ogRecord[key];
  });
if (ogPending.length > 0) {
  brandRows.push([
    `public/og/{${ogPending.join(', ')}}.png`,
    `${OG_REAL}. Placeholders générés : les remplacer par les visuels réels (même nom de fichier)`,
  ]);
}

const envNotes = [
  ['PUBLIC_SITE_URL', 'URL publique (canonical, sitemap, Open Graph)'],
  ['PUBLIC_FORM_ENDPOINT', 'Endpoint du formulaire de contact et de la newsletter'],
  ['PUBLIC_BOOKING_URL', 'Lien Calendly ou équivalent (vide : bouton masqué)'],
  ['PUBLIC_ANALYTICS_DOMAIN', 'Domaine Plausible (vide : mesure désactivée)'],
];

const uniqueTokens = new Set(textRows.map((row) => `${row.file}::${row.token}`));
const total = textRows.length + assetRows.size + brandRows.length;

if (warnOnly) {
  if (total > 0) {
    console.warn(
      `\n[placeholders] ${textRows.length} texte(s), ${assetRows.size} image(s) et ${brandRows.length} asset(s) de marque sont encore des placeholders ` +
        `(${new Set(textRows.map((r) => r.file)).size} fichiers). Liste complète : npm run placeholders:check, puis PLACEHOLDERS.md\n`,
    );
  } else {
    console.log('[placeholders] aucun placeholder restant.');
  }
  process.exit(0);
}

// --- PLACEHOLDERS.md -----------------------------------------------------------------------------
const esc = (s) => s.replaceAll('|', '\\|');
let md = `# Placeholders restants

Fichier généré par \`npm run placeholders:check\`. Ne pas éditer à la main.

- Textes entre crochets : ${textRows.length} occurrences dans ${new Set(textRows.map((r) => r.file)).size} fichiers (${uniqueTokens.size} uniques par fichier)
- Images placeholders référencées : ${assetRows.size}
- Assets de marque à fournir : ${brandRows.length}

Remplacer un texte : modifier la valeur dans le fichier indiqué. Remplacer une image : déposer le fichier réel dans \`public/\`
(par exemple \`public/images/\`), puis changer le chemin dans le front-matter du contenu concerné.

## Assets de marque et de scène

| Fichier | Format attendu |
|---|---|
${brandRows.map(([file, format]) => `| \`${file}\` | ${esc(format)} |`).join('\n') || '| (aucun) | |'}

## Variables d'environnement (.env)

| Variable | Rôle |
|---|---|
${envNotes.map(([name, role]) => `| \`${name}\` | ${role} |`).join('\n')}

## Images placeholders

| Placeholder | Utilisé dans | Format du fichier réel |
|---|---|---|
${[...assetRows.entries()]
  .map(([file, { slot, files }]) => {
    const format = slot.kind === 'logo' ? FORMATS.logo.real : slot.kind === 'avatar' ? FORMATS['1x1'].real : FORMATS[slot.format].real;
    return `| \`public/placeholders/${file}\` (${slot.label}) | ${[...files].map((f) => `\`${f}\``).join(', ')} | ${format} |`;
  })
  .join('\n') || '| (aucune) | | |'}

## Textes

`;

const byFile = new Map();
for (const row of textRows) {
  if (!byFile.has(row.file)) byFile.set(row.file, []);
  byFile.get(row.file).push(row);
}
for (const [file, rows] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  md += `### \`${file}\`\n\n| Ligne | Placeholder | Contenu attendu |\n|---|---|---|\n`;
  for (const row of rows) md += `| ${row.line} | \`${esc(row.token)}\` | ${esc(row.format)} |\n`;
  md += '\n';
}

writeFileSync(join(root, 'PLACEHOLDERS.md'), md);
console.log(`PLACEHOLDERS.md écrit : ${textRows.length} textes, ${assetRows.size} images, ${brandRows.length} assets de marque.`);
