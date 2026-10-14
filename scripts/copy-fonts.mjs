// Copies the two self-hosted woff2 files (latin subset) from Fontsource into public/fonts.
// The output is committed, so this only needs to run when a font is updated: npm run fonts:copy
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'fonts');
mkdirSync(out, { recursive: true });

const files = [
  {
    // Bodoni Moda, axes opsz 6..96 and wght 400..900 (same axes as the Google Fonts reference URL)
    from: 'node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2',
    to: 'bodoni-moda-latin-var.woff2',
  },
  {
    // Instrument Sans, axis wght 400..700
    from: 'node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
    to: 'instrument-sans-latin-var.woff2',
  },
];

for (const { from, to } of files) {
  copyFileSync(join(root, from), join(out, to));
  console.log(`${to}  ${(statSync(join(out, to)).size / 1024).toFixed(1)} KB`);
}
