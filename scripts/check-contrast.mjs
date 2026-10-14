// WCAG contrast figures for the palette, the Ambiance glows and the ember at its brightest allowed states
// (brief 7.6 and 12: text >= 4.5:1, also on the maximum revealed state). Usage: npm run contrast:check
// The ember ramp below mirrors the shader in src/scripts/ember/shaders.ts; the caps come from src/config/ember.ts.
import { readFileSync } from 'node:fs';
import { emberDefaults } from '../src/config/ember.ts';

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
/** Colour over a background with straight alpha. */
const over = (fg, alpha, bg) => mix(bg, fg, alpha);

const C = {
  charbon: hex('#0e0b0a'),
  cendre: hex('#2a2421'),
  nuit: hex('#1b2733'),
  profond: hex('#2f4670'),
  chauffe: hex('#4c78a8'),
  pale: hex('#9db3c6'),
  flamme: hex('#f05a1c'),
  or: hex('#c9a96e'),
  ivoire: hex('#f6eee3'),
};

const look = emberDefaults.look;

/** Fissure colour for a heat value: same stops as the shader (deep red, red, flamme, amber, white hot). */
function fissure(heat) {
  let c = [0.302, 0.0627, 0.0353];
  c = mix(c, [0.7804, 0.149, 0.0627], smooth(0.06, 0.3, heat));
  c = mix(c, [0.9412, 0.3529, 0.1098], smooth(0.38, 0.78, heat));
  c = mix(c, [0.9529, 0.6039, 0.251], smooth(0.78, 1.1, heat) * look.core);
  c = mix(c, [0.9647, 0.8784, 0.7608], smooth(1.1, 1.5, heat) * look.core);
  return c;
}

/**
 * Worst-case colour of the revealed pile over the charbon page for a heat value: the lightest tone the pieces can
 * reach (the shader clamps every channel to CRUST_MAX) at their opacity, with the fissure over it (fully opaque
 * from heat 0.2).
 */
const CRUST_MAX = 0.26;
function ember(heat) {
  const crust = over([CRUST_MAX, CRUST_MAX, CRUST_MAX], look.crust, C.charbon);
  return over(fissure(heat), smooth(0.015, 0.2, heat), crust);
}

const z = emberDefaults.zones;
const underglow = { color: [0.62, 0.12, 0.05], alpha: 0.14 * look.halo };
// Backgrounds text can sit on
const nuit85 = over(C.nuit, 0.85, C.charbon);
// The blue Ambiance glow is attenuated by --glow-cool (src/styles/tokens.css, 1 = design-system value)
const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const glowCool = Number(tokens.match(/--glow-cool:\s*([\d.]+)/)?.[1] ?? 1);
const coolPeak = over(C.chauffe, 0.95 * glowCool, C.charbon); // Ambiance, top-left corner
const warmPeak = over(C.flamme, 0.95, C.charbon); // Ambiance, bottom-right corner
const calmEmber = ember(z.calmCap);
const calmWithGlow = over(underglow.color, underglow.alpha * (1 - z.reduce), calmEmber);
const softEmber = ember(z.softCap);
const maxEmber = ember(1.5);

const backgrounds = [
  ['charbon (page)', C.charbon],
  ['cendre (cards, fields)', C.cendre],
  ['titane-nuit 85 % (alternate sections)', nuit85],
  ['Ambiance cool glow, peak (top-left corner)', coolPeak],
  ['Ambiance flame glow, peak (bottom-right corner)', warmPeak],
  [`coal under long text (calmCap ${z.calmCap}, + warm glow)`, calmWithGlow],
  [`coal under display titles (softCap ${z.softCap})`, softEmber],
  ['coal unconstrained (amber core, free space only)', maxEmber],
];
const texts = [
  ['ivoire (ink)', C.ivoire, 4.5],
  ['titane-pale (muted)', C.pale, 4.5],
  ['or (labels, figures)', C.or, 4.5],
];

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad('Background', 52)}${texts.map(([name]) => pad(name, 22)).join('')}`);
let failures = 0;
const required = new Set([2, 5]); // the states the brief requires to be readable: alternate sections, calm zones
backgrounds.forEach(([label, bg], index) => {
  const cells = texts.map(([, fg, min]) => {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok && required.has(index)) failures++;
    return pad(`${r.toFixed(1)}:1 ${ok ? 'ok' : 'low'}`, 22);
  });
  console.log(`${pad(label, 52)}${cells.join('')}`);
});

// Large display titles only need 3:1
const titleRatio = ratio(C.ivoire, softEmber);
console.log(`\nIvory display title (large text, needs 3:1) over the soft-zone coal: ${titleRatio.toFixed(1)}:1 ${titleRatio >= 3 ? 'ok' : 'LOW'}`);
if (titleRatio < 3) failures++;

console.log(
  '\nNotes: the Ambiance glows are fixed to the viewport corners, so text scrolled into the very corner' +
    '\n(bottom-right flame glow, top-left cool glow) sits on a lighter background than charbon. The peak rows' +
    '\nshow the worst case; keep small muted text out of those corners or use ivory there.',
);
if (failures > 0) {
  console.error(`\n${failures} required combination(s) below the threshold.`);
  process.exit(1);
}
console.log('\nRequired combinations pass.');
