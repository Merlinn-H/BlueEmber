// Procedural "flame in bas-relief" used as the placeholder fragment (brief section 7.3).
// Four organic tongues welded by a low mound, cut flat at the bottom edge only: the sides stay
// free-form so the fragment can sit against the left or the right screen edge.
// Matte basalt look: charcoal to ash, raking light from the top left, cool titane-pale highlights
// on the ridges. Output is a 600 x 800 SVG (ratio 3:4) plus an alpha-only twin used by the
// WebGL rim light.

export const FLAME_W = 600;
export const FLAME_H = 800;

const r = (n) => Math.round(n * 10) / 10;

// Tongue definitions: base position, height, width, lean (steady drift), curl (bend near the tip),
// wobble (S-curve amplitude) and phase.
const TONGUES = [
  { x0: 515, y0: 810, h: 300, w: 140, lean: 0.05, curl: 0.16, wobble: 0.07, phase: 2.4 },
  { x0: 432, y0: 810, h: 480, w: 230, lean: 0.07, curl: 0.15, wobble: 0.075, phase: 1.9 },
  { x0: 172, y0: 810, h: 570, w: 262, lean: -0.07, curl: -0.14, wobble: 0.075, phase: 1.0 },
  { x0: 302, y0: 810, h: 770, w: 330, lean: 0.06, curl: 0.15, wobble: 0.07, phase: 0.2 },
];

function center(spec, t) {
  const { x0, y0, h, lean, curl, wobble, phase } = spec;
  const x =
    x0 +
    h * (lean * t ** 1.5 + curl * t ** 3.2) +
    h * wobble * Math.sin(phase + t * Math.PI * 2.2) * Math.sin(Math.PI * t);
  return [x, y0 - h * t];
}

function halfWidth(spec, t) {
  return (spec.w / 2) * (1 - t) ** 0.74 * (1 + 0.32 * Math.sin(Math.PI * Math.min(1, t * 1.1)));
}

// Catmull-Rom spline through the points, expressed as cubic Beziers.
function spline(pts) {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

/**
 * One tongue outline. `wf` narrows it, `hf` shortens it, `shift` slides it toward the light
 * (negative x) so nested folds read as relief rather than concentric copies.
 */
function tonguePath(spec, { wf = 1, hf = 1, shift = 0 } = {}) {
  const n = 40;
  const left = [];
  const right = [];
  const eps = 0.002;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * hf;
    const u = t / hf; // 0 at the base, 1 at the tip of this layer
    const [cx, cy] = center(spec, t);
    const [ax, ay] = center(spec, Math.max(0, t - eps));
    const [bx, by] = center(spec, Math.min(1, t + eps));
    const tx = bx - ax;
    const ty = by - ay;
    const len = Math.hypot(tx, ty) || 1;
    const nx = -ty / len;
    const ny = tx / len;
    const hw = halfWidth(spec, u) * wf;
    const sx = shift * (1 - wf) * (spec.w / 2);
    left.push([cx - nx * hw - sx, cy - ny * hw]);
    right.push([cx + nx * hw - sx, cy + ny * hw]);
  }
  const rightRev = [...right].reverse();
  return `M${r(left[0][0])} ${r(left[0][1])}${spline(left)}${spline(rightRev)}Z`;
}

// Low wavy mound that welds the tongues together at the base. Sides taper down inside the box.
function massPath() {
  const pts = [[26, 836]];
  for (let x = 40; x <= 560; x += 40) {
    const edge = Math.min(1, Math.min(x - 26, 574 - x) / 70);
    const lift = 1 - (1 - edge) ** 2;
    pts.push([x, 836 - (836 - (708 + Math.sin(x * 0.019 + 1.2) * 20 + Math.sin(x * 0.047) * 9)) * lift]);
  }
  pts.push([574, 836]);
  return `M26 836${spline(pts)}Z`;
}

const outlines = () => [massPath(), ...TONGUES.map((t) => tonguePath(t))];

// The base fades out instead of ending on a hard horizontal edge, so the fragment works anywhere
// on screen. Pages that rest it on the bottom edge push this fade below the screen (cutY).
const FADE_DEFS = `<linearGradient id="fadeG" gradientUnits="userSpaceOnUse" x1="0" y1="660" x2="0" y2="${FLAME_H}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <mask id="fadeBottom" maskUnits="userSpaceOnUse" x="0" y="0" width="${FLAME_W}" height="${FLAME_H}"><rect width="${FLAME_W}" height="${FLAME_H}" fill="url(#fadeG)"/></mask>`;

// Fold layers (outer, middle, inner) feed the height map used by the lighting filter.
const FOLDS = [
  { wf: 0.64, hf: 0.86, shift: 0.55 },
  { wf: 0.32, hf: 0.66, shift: 0.8 },
];

export function buildFlameSvg() {
  const sil = outlines();
  const defs = sil.map((d, i) => `<path id="s${i}" d="${d}"/>`).join('\n      ');
  const folds = TONGUES.flatMap((spec) => FOLDS.map((f) => tonguePath(spec, f)));
  const height = [
    ...sil.map((_, i) => `<use href="#s${i}" fill="url(#base)" fill-opacity=".5"/>`),
    ...folds.map((d) => `<path d="${d}" fill="url(#base)" fill-opacity=".5"/>`),
  ].join('\n    ');
  const silMask = sil.map((_, i) => `<use href="#s${i}" fill="#fff"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FLAME_W}" height="${FLAME_H}" viewBox="0 0 ${FLAME_W} ${FLAME_H}">
  <title>Fragment : flamme sculptee en bas-relief (placeholder)</title>
  <defs>
      ${defs}
    <!-- Matiere : charbon poli a cendre, plus clair en haut a gauche (lumiere rasante) -->
    <linearGradient id="base" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${FLAME_W}" y2="${FLAME_H}">
      <stop offset="0" stop-color="#3a3430"/>
      <stop offset=".35" stop-color="#2a2421"/>
      <stop offset=".7" stop-color="#16110f"/>
      <stop offset="1" stop-color="#0b0807"/>
    </linearGradient>
    <!-- Reflet froid diffus sur le flanc eclaire -->
    <radialGradient id="sheen" gradientUnits="userSpaceOnUse" cx="60" cy="120" r="520">
      <stop offset="0" stop-color="#9db3c6" stop-opacity=".3"/>
      <stop offset=".45" stop-color="#9db3c6" stop-opacity=".09"/>
      <stop offset="1" stop-color="#9db3c6" stop-opacity="0"/>
    </radialGradient>
    <!-- Ombre noire chaude dans les plis, cote oppose a la lumiere -->
    <radialGradient id="umbra" gradientUnits="userSpaceOnUse" cx="560" cy="800" r="640">
      <stop offset="0" stop-color="#050202" stop-opacity=".62"/>
      <stop offset=".6" stop-color="#050202" stop-opacity=".18"/>
      <stop offset="1" stop-color="#050202" stop-opacity="0"/>
    </radialGradient>
    <!-- Bas-relief : la carte de hauteur est l'alpha cumule des plis ; la lumiere vient du haut a gauche.
         Le chemin couleur est rendu opaque avant le multiply pour ne pas laisser fuir le fond. -->
    <filter id="relief" filterUnits="userSpaceOnUse" x="-40" y="-40" width="${FLAME_W + 80}" height="${FLAME_H + 80}" color-interpolation-filters="sRGB">
      <feComponentTransfer in="SourceGraphic" result="solid">
        <feFuncA type="linear" slope="2"/>
      </feComponentTransfer>
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="11" diffuseConstant="1.4" lighting-color="#ffffff" result="diffuse">
        <feDistantLight azimuth="225" elevation="42"/>
      </feDiffuseLighting>
      <feBlend in="solid" in2="diffuse" mode="multiply" result="shaded"/>
      <feSpecularLighting in="height" surfaceScale="11" specularConstant="1.1" specularExponent="22" lighting-color="#9db3c6" result="specular">
        <feDistantLight azimuth="225" elevation="34"/>
      </feSpecularLighting>
      <feComposite in="shaded" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit"/>
      <feComposite in="lit" in2="solid" operator="in"/>
    </filter>
    <mask id="silhouette" maskUnits="userSpaceOnUse" x="0" y="0" width="${FLAME_W}" height="${FLAME_H}">
      ${silMask}
    </mask>
    ${FADE_DEFS}
  </defs>
  <g mask="url(#fadeBottom)">
    <g filter="url(#relief)">
      ${height}
    </g>
    <g mask="url(#silhouette)">
      <rect width="${FLAME_W}" height="${FLAME_H}" fill="url(#umbra)"/>
      <rect width="${FLAME_W}" height="${FLAME_H}" fill="url(#sheen)"/>
    </g>
  </g>
</svg>
`;
}

// Alpha-only twin: white silhouette on transparent, sampled by the shader for the rim light.
export function buildFlameAlphaSvg() {
  const paths = outlines()
    .map((d) => `<path d="${d}" fill="#fff"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FLAME_W}" height="${FLAME_H}" viewBox="0 0 ${FLAME_W} ${FLAME_H}"><defs>${FADE_DEFS}</defs><g mask="url(#fadeBottom)">${paths}</g></svg>
`;
}
