import { SPARK_STRIDE, type EmberRenderer, type FrameData, type RendererAssets } from './types';

// Intermediate tier (brief 7.7): 2D canvas with a pre-generated crack texture revealed by a radial mask
// (destination-in) whose trail fades with a translucent veil on every frame. No heat haze, no rim light.

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Tileable Voronoi cracks (F2 - F1) coloured with the ember ramp, generated once. */
function makeCracksTexture(size = 384, cells = 6): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const image = ctx.createImageData(size, size);
  const points = new Float32Array(cells * cells * 2);
  let seed = 1337;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < points.length; i++) points[i] = 0.12 + random() * 0.76;
  const cell = size / cells;

  const ash = [[21, 17, 15], [42, 36, 33]];
  const stops = [[47, 70, 112], [76, 120, 168], [157, 179, 198]];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      let f1 = Infinity;
      let f2 = Infinity;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const index = (((cy + j + cells) % cells) * cells + ((cx + i + cells) % cells)) * 2;
          const dx = x - (cx + i + points[index]) * cell;
          const dy = y - (cy + j + points[index + 1]) * cell;
          const d = dx * dx + dy * dy;
          if (d < f1) {
            f2 = f1;
            f1 = d;
          } else if (d < f2) {
            f2 = d;
          }
        }
      }
      const crack = 1 - smoothstep(0, 0.085, (Math.sqrt(f2) - Math.sqrt(f1)) / cell);
      const grain = ((x * 73856093) ^ (y * 19349663)) & 255;
      const base = mix(0, 1, 0.5 + (grain / 255 - 0.5) * 0.5);
      let r = mix(ash[0][0], ash[1][0], base);
      let g = mix(ash[0][1], ash[1][1], base);
      let b = mix(ash[0][2], ash[1][2], base);
      // ash -> edge -> crack -> incandescent, driven by the crack value
      const levels = [smoothstep(0.05, 0.3, crack), smoothstep(0.28, 0.62, crack), smoothstep(0.62, 0.95, crack)];
      levels.forEach((level, k) => {
        r = mix(r, stops[k][0], level);
        g = mix(g, stops[k][1], level);
        b = mix(b, stops[k][2], level);
      });
      const o = (y * size + x) * 4;
      image.data[o] = r;
      image.data[o + 1] = g;
      image.data[o + 2] = b;
      image.data[o + 3] = 255;
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
        gradient.addColorStop(0, `rgba(255,255,255,${strength * 0.5})`);
        gradient.addColorStop(0.55, `rgba(255,255,255,${strength * 0.18})`);
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
    layerCtx.fillStyle = this.pattern ?? '#15110f';
    layerCtx.fillRect(0, 0, w, h);
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.drawImage(this.mask, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = Math.min(1, frame.intensity);
    ctx.drawImage(this.layer, 0, 0);
    ctx.globalAlpha = 1;

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

  clear(): void {
    this.maskCtx.clearRect(0, 0, this.mask.width, this.mask.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    this.clear();
  }
}
