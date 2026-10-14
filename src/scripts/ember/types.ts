import type { EmberParams } from '../../config/ember';

export type EmberTier = 'webgl' | 'canvas2d' | 'static';

export const MAX_SEGMENTS = 8;
export const MAX_BURSTS = 4;
export const MAX_ZONES = 8;
export const SPARK_STRIDE = 7; // x, y, size, alpha, r, g, b
/** Hard ceiling of simultaneous sparks (the brief asks for 200; the debug panel can go higher). */
export const SPARK_CAPACITY = 512;

/** Everything a renderer needs for one frame. Typed arrays are reused: no allocation per frame. */
export interface FrameData {
  /** Seconds since start (wrapped). */
  time: number;
  dt: number;
  /** Viewport size in CSS px. */
  width: number;
  height: number;
  /** Page / section intensity (0 to 1.2). */
  intensity: number;
  /** exp(-dt / tau): trail decay for this frame. */
  decay: number;

  segmentCount: number;
  /** x0, y0, x1, y1 (CSS px) per segment. */
  segments: Float32Array;
  /** radius (px), intensity per segment. */
  segmentParams: Float32Array;

  burstCount: number;
  /** x, y, radius (px), strength per burst. */
  bursts: Float32Array;

  zoneCount: number;
  /** x, y, w, h (CSS px) per zone. */
  zones: Float32Array;
  /** reduce (0..1), heat cap per zone. */
  zoneParams: Float32Array;

  /** Fragment rect x, y, w, h in CSS px; w = 0 when there is none. */
  fragment: Float32Array;

  sparkCount: number;
  sparks: Float32Array;

  params: EmberParams;
}

export interface RendererAssets {
  /** Alpha mask of the fragment, drawn into a small canvas. */
  mask: HTMLCanvasElement | null;
  /** Optional crack texture (public/textures/ember-cracks.webp) replacing the procedural one. */
  cracks: HTMLImageElement | null;
}

export interface EmberRenderer {
  readonly kind: 'webgl' | 'canvas2d';
  init(assets: RendererAssets): Promise<void>;
  /** `scale` is the ember resolution relative to the canvas, `dpr` the (capped) device pixel ratio. */
  resize(width: number, height: number, dpr: number, scale: number): void;
  render(frame: FrameData): void;
  /** Empties the trail and the canvas. */
  clear(): void;
  destroy(): void;
}

export function createFrameData(params: EmberParams): FrameData {
  return {
    time: 0,
    dt: 0,
    width: 0,
    height: 0,
    intensity: 1,
    decay: 1,
    segmentCount: 0,
    segments: new Float32Array(MAX_SEGMENTS * 4),
    segmentParams: new Float32Array(MAX_SEGMENTS * 2),
    burstCount: 0,
    bursts: new Float32Array(MAX_BURSTS * 4),
    zoneCount: 0,
    zones: new Float32Array(MAX_ZONES * 4),
    zoneParams: new Float32Array(MAX_ZONES * 2),
    fragment: new Float32Array(4),
    sparkCount: 0,
    sparks: new Float32Array(SPARK_CAPACITY * SPARK_STRIDE),
    params,
  };
}
