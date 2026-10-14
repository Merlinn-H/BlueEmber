// Converts text to SVG path outlines with the brand fonts, so generated SVG/PNG files
// do not depend on fonts installed on the machine that renders them.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadFont(relativePath) {
  const buf = readFileSync(join(root, relativePath));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export const fonts = {
  // Static WOFF files (opentype.js cannot read woff2). Same families as the site.
  bodoni500: () => loadFont('node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-500-normal.woff'),
  instrument400: () => loadFont('node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff'),
  instrument600: () => loadFont('node_modules/@fontsource/instrument-sans/files/instrument-sans-latin-600-normal.woff'),
};

export const round = (n) => Math.round(n * 100) / 100;

// Serializes glyph path commands directly. opentype.js 2.0.0's own toPathData() occasionally
// emits NaN for some glyphs, so it is not used here.
function commandsToD(commands) {
  const n = (v) => String(round(v));
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        default:
          return 'Z';
      }
    })
    .join('');
}

/**
 * Lays out `text` glyph by glyph (kerning + tracking) and returns path data.
 * `tracking` is in em. `anchor` is 'start' | 'middle' | 'end' relative to x.
 * Returns the whole path (`d`), one path per glyph (`parts`), the advance `width`
 * and the ink bounding box (`bbox`, control points included).
 */
export function textPath(font, text, { size, x = 0, y = 0, tracking = 0, anchor = 'start' }) {
  const scale = size / font.unitsPerEm;
  const chars = [...text];
  const glyphs = chars.map((ch) => font.charToGlyph(ch));
  const placed = [];
  let cursor = 0;
  glyphs.forEach((glyph, i) => {
    placed.push({ glyph, offset: cursor });
    cursor += (glyph.advanceWidth ?? 0) * scale;
    if (i < glyphs.length - 1) {
      // Some class-based kerning pairs come back non-finite; treat them as no kerning.
      const kern = font.getKerningValue(glyph, glyphs[i + 1]);
      cursor += (Number.isFinite(kern) ? kern * scale : 0) + tracking * size;
    }
  });
  const width = cursor;
  const x0 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;

  const bbox = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  const parts = placed.map(({ glyph, offset }, i) => {
    const { commands } = glyph.getPath(x0 + offset, y, size, undefined, font);
    for (const c of commands) {
      for (const [px, py] of [
        [c.x, c.y],
        [c.x1, c.y1],
        [c.x2, c.y2],
      ]) {
        if (Number.isFinite(px) && Number.isFinite(py)) {
          bbox.x1 = Math.min(bbox.x1, px);
          bbox.y1 = Math.min(bbox.y1, py);
          bbox.x2 = Math.max(bbox.x2, px);
          bbox.y2 = Math.max(bbox.y2, py);
        }
      }
    }
    return { ch: chars[i], d: commandsToD(commands) };
  });
  const d = parts.map((p) => p.d).join('');
  if (d.includes('NaN') || !Number.isFinite(width)) {
    throw new Error(`textPath produced invalid geometry for "${text}"`);
  }
  return { d, parts, width, x: x0, bbox };
}
