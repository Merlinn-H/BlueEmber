export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

/** Frame-rate independent exponential smoothing. Higher `lambda` settles faster (about 3 / lambda seconds). */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** A per-frame lerp factor defined at 60 fps, made independent of the real frame rate. */
export const lerpFactor = (perFrame: number, dt: number): number => 1 - (1 - perFrame) ** (dt * 60);
