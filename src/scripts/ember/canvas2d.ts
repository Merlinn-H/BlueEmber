import { SPARK_STRIDE, type EmberRenderer, type FrameData, type RendererAssets } from './types';

// Intermediate tier (brief 7.7): 2D canvas with a pre-generated texture (pile of charcoal and wood, glowing gaps)
// revealed by a radial mask (destination-in) whose trail fades with a translucent veil on every frame.
// No heat haze, no rim light on the fragment, no cooling of the fissures.

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Integer hash to [0, 1). */
function hash(x: number, y: number, s = 0): number {
  let h = (Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(s + 1, 0x9e3779b1)) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Value noise on an integer lattice that wraps every `period` cells, so the texture tiles. */
function vnoise(x: number, y: number, period = 65536, s = 0): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const m = (v: number) => ((v % period) + period) % period;
  const a = hash(m(x0), m(y0), s);
  const b = hash(m(x0 + 1), m(y0), s);
  const c = hash(m(x0), m(y0 + 1), s);
  const d = hash(m(x0 + 1), m(y0 + 1), s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

interface Nearest {
  /** Distance to the nearest and to the second nearest feature point, in cells. */
  f1: number;
  f2: number;
  /** Lattice cell of the nearest feature point. */
  id: number;
  jd: number;
  /** Pixel minus the nearest feature point, in cells. */
  ux: number;
  uy: number;
}

/** Cellular noise on a wrapping grid of `cells` x `cells` jittered points. */
function nearest(px: number, py: number, cells: number, size: number, points: Float32Array, out: Nearest): void {
  const cell = size / cells;
  const cx = Math.floor(px / cell);
  const cy = Math.floor(py / cell);
  let f1 = Infinity;
  let f2 = Infinity;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const wi = (((cx + i) % cells) + cells) % cells;
      const wj = (((cy + j) % cells) + cells) % cells;
      const index = (wj * cells + wi) * 2;
      const dx = (px - (cx + i + points[index]) * cell) / cell;
      const dy = (py - (cy + j + points[index + 1]) * cell) / cell;
      const d = dx * dx + dy * dy;
      if (d < f1) {
        f2 = f1;
        f1 = d;
        out.id = wi;
        out.jd = wj;
        out.ux = dx;
        out.uy = dy;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  out.f1 = Math.sqrt(f1);
  out.f2 = Math.sqrt(f2);
}

const unit = (x: number, y: number, z: number): number[] => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
};

/**
 * Tileable pile of charcoal and charred wood with glowing gaps between the pieces, generated once. A CPU port of the
 * shader: angular matte charcoal facets, logs with fibres and cracks, light from the top left, red-hot fissures.
 */
function makeCracksTexture(size = 384, cells = 6): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const image = ctx.createImageData(size, size);
  let seed = 1337;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const cells2 = Math.round(cells * 2.7);
  const pieces = new Float32Array(cells * cells * 2).map(() => 0.12 + random() * 0.76);
  const facets = new Float32Array(cells2 * cells2 * 2).map(() => 0.12 + random() * 0.76);
  const a: Nearest = { f1: 0, f2: 0, id: 0, jd: 0, ux: 0, uy: 0 };
  const b: Nearest = { f1: 0, f2: 0, id: 0, jd: 0, ux: 0, uy: 0 };
  const L = unit(-0.55, -0.6, 0.58);
  const H = unit(L[0], L[1], L[2] + 1);

  // deep red, red, flamme, amber (same stops as the shader; this static texture only goes up to red)
  const stops = [[77, 16, 9], [199, 38, 16], [240, 90, 28], [243, 154, 64]];
  const crustAlpha = 204;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Sine warp (whole cycles over the texture, so it still tiles): the gaps wander like fissures, not like glass
      const wx = size * 0.03 * Math.sin((y / size) * 4 * Math.PI + 1.3) + size * 0.015 * Math.sin((y / size) * 10 * Math.PI);
      const wy = size * 0.03 * Math.sin((x / size) * 6 * Math.PI + 0.4) + size * 0.015 * Math.sin((x / size) * 14 * Math.PI + 2);
      const px = (x + wx + size) % size;
      const py = (y + wy + size) % size;
      nearest(px, py, cells, size, pieces, a);
      nearest(px, py, cells2, size, facets, b);
      const edge1 = a.f2 - a.f1;
      const edge2 = b.f2 - b.f1;
      const hA = hash(a.id, a.jd, 3);
      const hB = hash(a.id, a.jd, 9);
      const hC = hash(a.id, a.jd, 11);
      const isWood = hA < 0.3;

      // Charcoal: matte shards, one tilt per facet, a warm sheen on a few of them, tiny pores
      let nx = (hash(b.id, b.jd, 5) - 0.5) * 1.1 + (hB - 0.5) * 0.35 + (vnoise(px / 6, py / 6, size / 6, 1) - 0.5) * 0.55 + (vnoise(px / 3, py / 3, size / 3, 3) - 0.5) * 0.35;
      let ny = (hash(b.id, b.jd, 6) - 0.5) * 1.1 + (hC - 0.5) * 0.35 + (vnoise(px / 6, py / 6, size / 6, 2) - 0.5) * 0.55 + (vnoise(px / 3, py / 3, size / 3, 4) - 0.5) * 0.35;
      const nl = Math.hypot(nx, ny, 1);
      nx /= nl;
      ny /= nl;
      const nz = 1 / nl;
      const dc = Math.max(nx * L[0] + ny * L[1] + nz * L[2], 0) * (0.6 + 0.8 * hB);
      const sc = Math.pow(Math.max(nx * H[0] + ny * H[1] + nz * H[2], 0), 40) * (hash(b.id, b.jd, 7) > 0.62 ? 1 : 0);
      const pits = 1 - 0.4 * smoothstep(0.62, 0.8, vnoise(px / 1.6, py / 1.6, size / 1.6, 5));
      const ao2 = 0.72 + 0.28 * smoothstep(0, 0.1, edge2);
      // Warm light of the heat, baked at 80 %
      const coal = [
        (0.034 + (0.12 * dc + 0.19 * sc) * 0.8) * pits * ao2,
        (0.03 + (0.074 * dc + 0.12 * sc) * 0.8) * pits * ao2,
        (0.028 + (0.054 * dc + 0.085 * sc) * 0.8) * pits * ao2,
      ];

      // Wood: a log in the cell, cylinder lighting, brown fibres on black char, cracks across and along the grain
      const ang = hash(a.id, a.jd, 4) * Math.PI;
      const along = a.ux * Math.cos(ang) + a.uy * Math.sin(ang);
      const across = -a.ux * Math.sin(ang) + a.uy * Math.cos(ang);
      const rag = vnoise(along * 7 + a.id * 3.1, across * 9 + a.jd * 2.3, 65536, 6) - 0.5;
      const body = 1 - smoothstep(0.78, 1, Math.hypot(along / 0.7, across / 0.27) + rag * 0.4);
      const cy = Math.max(-1, Math.min(1, across / 0.27));
      const wn = unit(-Math.sin(ang) * cy * 0.9, Math.cos(ang) * cy * 0.9, Math.sqrt(Math.max(1 - 0.8 * cy * cy, 0.05)));
      const dw = Math.max(wn[0] * L[0] + wn[1] * L[1] + wn[2] * L[2], 0);
      const fibre = Math.min(
        1,
        Math.pow(0.55 * vnoise(across * 15 + a.id * 11, along * 1.6 + a.jd * 5, 65536, 7) + 0.45 * vnoise(across * 34 + a.id * 5, along * 3.2 + a.jd * 9, 65536, 8), 1.5) * 1.6,
      );
      const frac = (v: number) => v - Math.floor(v);
      const tc = Math.abs(frac(along * 3.4 + 0.35 * vnoise(across * 5, a.id * 3.7, 65536, 9) + hB) - 0.5);
      const lc = Math.abs(frac(across * 3.6 + 0.25 * vnoise(along * 3, a.jd * 2.9, 65536, 10) + hC) - 0.5);
      const crk = 1 - smoothstep(0, 0.045, Math.min(tc, lc));
      const lw = (0.5 + 0.9 * dw) * 0.8 * (1 - 0.7 * crk);
      const wood = [mix(0.03, 0.2, fibre) * lw, mix(0.025, 0.112, fibre) * lw, mix(0.022, 0.066, fibre) * lw];
      const inLog = isWood ? body : 0;

      // Lighting of the pile: slow mottling, dark recesses along the gaps, bright edges facing the light
      const shade = (0.85 + 0.3 * vnoise(px / 48, py / 48, size / 48, 11)) * (0.55 + 0.45 * smoothstep(0, 0.2, edge1));
      const rim1 = (1 - smoothstep(0, 0.09, edge1)) * Math.max((-0.68 * a.ux - 0.74 * a.uy) / (Math.hypot(a.ux, a.uy) || 1), 0);
      const rim2 = (1 - smoothstep(0, 0.05, edge2)) * Math.max((-0.68 * b.ux - 0.74 * b.uy) / (Math.hypot(b.ux, b.uy) || 1), 0);
      const rim = 1 - 0.7 * inLog;
      const lit = [
        Math.min(0.26, mix(coal[0], wood[0], inLog) * shade + (0.19 * rim1 + 0.085 * rim2) * rim * 0.8),
        Math.min(0.26, mix(coal[1], wood[1], inLog) * shade + (0.115 * rim1 + 0.052 * rim2) * rim * 0.8),
        Math.min(0.26, mix(coal[2], wood[2], inLog) * shade + (0.08 * rim1 + 0.038 * rim2) * rim * 0.8),
      ];

      // Thin glowing gaps between the pieces, and the cracks of the logs: deep red, red at most
      const glow = Math.max(1 - smoothstep(0, 0.03, edge1), crk * inLog * 0.4) * 0.55;
      const bloom = (1 - smoothstep(0, 0.35, edge1)) * 0.06;
      let r = mix(lit[0] * 255, 127, bloom);
      let g = mix(lit[1] * 255, 24, bloom);
      let bl = mix(lit[2] * 255, 11, bloom);
      const levels = [
        smoothstep(0.03, 0.25, glow),
        smoothstep(0.2, 0.55, glow),
        smoothstep(0.55, 0.9, glow),
        smoothstep(0.9, 1, glow) * 0.5,
      ];
      levels.forEach((level, k) => {
        r = mix(r, stops[k][0], level);
        g = mix(g, stops[k][1], level);
        bl = mix(bl, stops[k][2], level);
      });
      const o = (y * size + x) * 4;
      image.data[o] = r;
      image.data[o + 1] = g;
      image.data[o + 2] = bl;
      // The pieces are mostly opaque, the thin glow a little more so
      image.data[o + 3] = mix(crustAlpha, 225, smoothstep(0.02, 0.22, glow));
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export class Canvas2DRenderer implements EmberRenderer {
  readonly kind = 'canvas2d' as const;

  private readonly mask = document.createElement('canvas');
  private readonly layer = document.createElement('canvas');
  private readonly maskCtx: CanvasRenderingContext2D;
  private readonly layerCtx: CanvasRenderingContext2D;
  private cracks: HTMLCanvasElement | HTMLImageElement | null = null;
  private pattern: CanvasPattern | null = null;
  private patternScale = 0;
  private k = 1;

  static create(canvas: HTMLCanvasElement): Canvas2DRenderer | null {
    const ctx = canvas.getContext('2d', { alpha: true });
    const mask = document.createElement('canvas').getContext('2d');
    return ctx && mask ? new Canvas2DRenderer(canvas, ctx) : null;
  }

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
  ) {
    const maskCtx = this.mask.getContext('2d');
    const layerCtx = this.layer.getContext('2d');
    if (!maskCtx || !layerCtx) throw new Error('2D context unavailable');
    this.maskCtx = maskCtx;
    this.layerCtx = layerCtx;
  }

  async init(assets: RendererAssets): Promise<void> {
    this.cracks = assets.cracks ?? makeCracksTexture();
    // Let the browser paint once before the first heavy frame
    await Promise.resolve();
  }

  resize(width: number, height: number, dpr: number, scale: number): void {
    const w = Math.max(1, Math.round(width * dpr * scale));
    const h = Math.max(1, Math.round(height * dpr * scale));
    for (const surface of [this.canvas, this.mask, this.layer]) {
      surface.width = w;
      surface.height = h;
    }
    this.k = w / width;
    this.pattern = this.cracks ? this.layerCtx.createPattern(this.cracks, 'repeat') : null;
    this.patternScale = 0;
  }

  render(frame: FrameData): void {
    const { ctx, maskCtx, layerCtx, k } = this;
    const p = frame.params;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. The mask trail fades with a translucent veil, then the new segments and rings are stamped
    maskCtx.globalCompositeOperation = 'destination-out';
    maskCtx.fillStyle = `rgba(0,0,0,${1 - frame.decay})`;
    maskCtx.fillRect(0, 0, w, h);
    maskCtx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < frame.segmentCount; i++) {
      const x0 = frame.segments[i * 4] * k;
      const y0 = frame.segments[i * 4 + 1] * k;
      const x1 = frame.segments[i * 4 + 2] * k;
      const y1 = frame.segments[i * 4 + 3] * k;
      const radius = frame.segmentParams[i * 2] * k;
      const strength = frame.segmentParams[i * 2 + 1];
      const length = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.ceil(length / (radius * 0.4)));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        const gradient = maskCtx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255,255,255,${strength * 0.4})`);
        gradient.addColorStop(0.55, `rgba(255,255,255,${strength * 0.12})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        maskCtx.fillStyle = gradient;
        maskCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
    for (let i = 0; i < frame.burstCount; i++) {
      maskCtx.lineWidth = 30 * k;
      maskCtx.strokeStyle = `rgba(255,255,255,${Math.min(1, frame.bursts[i * 4 + 3] * 0.8)})`;
      maskCtx.beginPath();
      maskCtx.arc(frame.bursts[i * 4] * k, frame.bursts[i * 4 + 1] * k, Math.max(1, frame.bursts[i * 4 + 2] * k), 0, Math.PI * 2);
      maskCtx.stroke();
    }

    // 2. Crack texture, restricted to the mask
    const wanted = (p.look.crackScale * k) / 64;
    if (this.pattern && Math.abs(wanted - this.patternScale) > 0.001) {
      this.pattern.setTransform(new DOMMatrix().scale(wanted));
      this.patternScale = wanted;
    }
    layerCtx.globalCompositeOperation = 'source-over';
    layerCtx.fillStyle = this.pattern ?? 'rgba(36,22,17,0.55)';
    layerCtx.fillRect(0, 0, w, h);
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.drawImage(this.mask, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = Math.min(1, frame.intensity) * 0.7;
    ctx.drawImage(this.layer, 0, 0);
    ctx.globalAlpha = 1;

    // 2b. Let the Ambiance glows show through: erase part of the pile where they are, so there is no seam with the
    // background (the WebGL tier does it exactly, by adding the glows to the pile)
    ctx.globalCompositeOperation = 'destination-out';
    const bw = frame.width + 48;
    const bh = frame.height + 48;
    this.eraseGlow(0, 0, bw * 0.62, bh * 0.7, [0.95, 0.7, 0.3], frame.glowCool);
    this.eraseGlow(frame.width, frame.height, bw * 0.7, bh * 0.8, [0.95, 0.6, 0.25], 1);

    // 3. Calm zones: erase most of the effect behind long text
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < frame.zoneCount; i++) {
      const reduce = frame.zoneParams[i * 2];
      const x = frame.zones[i * 4] * k;
      const y = frame.zones[i * 4 + 1] * k;
      const zw = frame.zones[i * 4 + 2] * k;
      const zh = frame.zones[i * 4 + 3] * k;
      const grow = p.zones.fade * k * 0.5;
      ctx.fillStyle = `rgba(0,0,0,${reduce * 0.4})`;
      ctx.fillRect(x - grow, y - grow, zw + grow * 2, zh + grow * 2);
      ctx.fillStyle = `rgba(0,0,0,${reduce})`;
      ctx.fillRect(x, y, zw, zh);
    }

    // 4. Sparks
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < frame.sparkCount; i++) {
      const o = i * SPARK_STRIDE;
      ctx.fillStyle = `rgba(${Math.round(frame.sparks[o + 4] * 255)},${Math.round(frame.sparks[o + 5] * 255)},${Math.round(frame.sparks[o + 6] * 255)},${frame.sparks[o + 3]})`;
      ctx.beginPath();
      ctx.arc(frame.sparks[o] * k, frame.sparks[o + 1] * k, Math.max(0.8, frame.sparks[o + 2] * k * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /** Erases a share of the pile with the shape of an Ambiance glow (CSS px, stops at 0, 30, 55 and 72 % of the ellipse). */
  private eraseGlow(cx: number, cy: number, rx: number, ry: number, alphas: number[], strength: number): void {
    const { ctx, k } = this;
    ctx.save();
    ctx.translate(cx * k, cy * k);
    ctx.scale(rx * k, ry * k);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    [0, 0.3, 0.55].forEach((offset, i) => gradient.addColorStop(offset, `rgba(0,0,0,${Math.min(0.8, alphas[i] * strength * 0.9)})`));
    gradient.addColorStop(0.72, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(-0.75, -0.75, 1.5, 1.5);
    ctx.restore();
  }

  clear(): void {
    this.maskCtx.clearRect(0, 0, this.mask.width, this.mask.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    this.clear();
  }
}
