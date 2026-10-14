import type { EmberParams } from '../../config/ember';
import { clamp, lerp } from '../lib/math';
import { MAX_BURSTS, MAX_SEGMENTS, SPARK_CAPACITY, SPARK_STRIDE, type FrameData } from './types';

// CPU side of the effect: pointer gestures become brush segments (speed drives intensity and radius),
// sparks and click rings are simulated here, and everything is packed into the frame arrays.
interface Spark {
  x0: number;
  y0: number;
  vx: number;
  rise: number;
  amp: number;
  freq: number;
  phase: number;
  life: number;
  age: number;
  size: number;
  color: readonly number[];
}

interface Burst {
  x: number;
  y: number;
  start: number;
}

const PALE = [0.6157, 0.702, 0.7765] as const; // #9DB3C6
const IVORY = [0.9647, 0.9333, 0.8902] as const; // #F6EEE3
const FLAME = [0.9412, 0.3529, 0.1098] as const; // #F05A1C, the orange of the bottom right glow

export class EmberSim {
  readonly sparks: Spark[] = [];
  private bursts: Burst[] = [];
  private queue: number[] = []; // x0, y0, x1, y1, radius, intensity (flat)
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private hasPoint = false;
  private speed = 0;
  private headX = 0;
  private headY = 0;
  private moved = false;

  /** performance.now() of the last pointer input. */
  lastInput = 0;
  private lastIntensity = 0;
  private lastDeposit = 0;

  constructor(private readonly params: EmberParams) {}

  /** Forgets the previous point: the next position starts a new stroke (touch start / end). */
  breakStroke(): void {
    this.hasPoint = false;
    this.speed = 0;
  }

  /**
   * A pointer position. Speed over `speed.reference` (1500 px/s) gives full intensity and the widest
   * brush; slow gestures keep at least `minIntensity`. `fixedIntensity` is used by the touch "breathing".
   */
  push(x: number, y: number, now: number, viewWidth: number, radiusScale: number, fixedIntensity?: number): void {
    const p = this.params;
    if (this.hasPoint) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      const seconds = Math.max(1, now - this.lastTime) / 1000;
      this.speed = lerp(this.speed, Math.hypot(dx, dy) / seconds, 0.4);
      const norm = clamp(this.speed / p.speed.reference, 0, 1);
      const intensity = fixedIntensity ?? clamp(norm, p.speed.minIntensity, 1);
      const radius = lerp(p.brush.radiusMin, p.brush.radiusMax, norm) * (viewWidth / 1440) * radiusScale;
      if (dx !== 0 || dy !== 0) {
        this.queue.push(this.lastX, this.lastY, x, y, radius, intensity);
        this.lastIntensity = intensity;
        this.lastDeposit = now;
      }
    }
    this.lastX = this.headX = x;
    this.lastY = this.headY = y;
    this.lastTime = now;
    this.hasPoint = true;
    this.moved = true;
    this.lastInput = now;
  }

  /** The "breath": a ring leaves the click point and throws sparks. */
  burst(x: number, y: number, now: number): void {
    this.bursts.push({ x, y, start: now });
    if (this.bursts.length > MAX_BURSTS) this.bursts.shift();
    this.lastInput = now;
    this.lastIntensity = 1;
    this.lastDeposit = now;
    for (let i = 0; i < this.params.burst.sparks; i++) {
      const angle = (i / this.params.burst.sparks) * Math.PI * 2 + Math.random() * 0.4;
      this.spawn(x, y, 24 + Math.random() * 40, 60 + Math.random() * 90, angle);
    }
  }

  get burstCount(): number {
    return this.bursts.length;
  }

  /** Rough remaining brightness of the trail, to know when the loop can stop. */
  energy(now: number): number {
    return this.lastIntensity * Math.exp(-(now - this.lastDeposit) / 1000 / this.params.trail.tau);
  }

  reset(): void {
    this.queue.length = 0;
    this.sparks.length = 0;
    this.bursts = [];
    this.hasPoint = false;
    this.speed = 0;
    this.lastIntensity = 0;
  }

  /** Writes this frame's segments, rings and sparks into the frame data. */
  step(frame: FrameData, dt: number, now: number): void {
    const p = this.params;

    // Brush segments: at most 8 per frame, evenly sampled when the pointer was very fast
    const total = this.queue.length / 6;
    const count = Math.min(total, MAX_SEGMENTS);
    for (let i = 0; i < count; i++) {
      const source = (count === total ? i : Math.floor((i * total) / count)) * 6;
      frame.segments.set(this.queue.slice(source, source + 4), i * 4);
      frame.segmentParams[i * 2] = this.queue[source + 4];
      frame.segmentParams[i * 2 + 1] = this.queue[source + 5];
    }
    frame.segmentCount = count;
    this.queue.length = 0;

    // Click rings: 0 to radius px in `duration`, brightening the cracks as they pass
    this.bursts = this.bursts.filter((b) => (now - b.start) / 1000 < p.burst.duration);
    frame.burstCount = this.bursts.length;
    this.bursts.forEach((b, i) => {
      const t = (now - b.start) / 1000 / p.burst.duration;
      frame.bursts[i * 4] = b.x;
      frame.bursts[i * 4 + 1] = b.y;
      frame.bursts[i * 4 + 2] = p.burst.radius * (1 - (1 - t) ** 3);
      frame.bursts[i * 4 + 3] = (1 - t) ** 1.2;
    });

    // New sparks: 0 to 3 per frame according to the gesture speed
    if (this.moved) {
      const norm = clamp(this.speed / p.speed.reference, 0, 1);
      const born = Math.min(p.sparks.perFrame, Math.floor(norm * p.sparks.perFrame + Math.random()));
      for (let i = 0; i < born; i++) this.spawn(this.headX, this.headY, 60 + norm * 40, 0);
      this.moved = false;
    }

    // Sparks rise while undulating, then go out
    let written = 0;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      if ((this.sparks[i].age += dt) >= this.sparks[i].life) this.sparks.splice(i, 1);
    }
    for (const s of this.sparks) {
      if (written >= SPARK_CAPACITY) break;
      const k = s.age / s.life;
      const o = written * SPARK_STRIDE;
      frame.sparks[o] = s.x0 + s.vx * s.age + Math.sin(s.phase + s.age * s.freq) * s.amp * (0.3 + k);
      frame.sparks[o + 1] = s.y0 - s.rise * (1 - (1 - k) * (1 - k));
      frame.sparks[o + 2] = s.size * (1 - 0.45 * k);
      frame.sparks[o + 3] = (1 - k) ** 1.4 * (0.8 + 0.2 * Math.sin(s.phase * 3 + s.age * 18));
      frame.sparks[o + 4] = s.color[0];
      frame.sparks[o + 5] = s.color[1];
      frame.sparks[o + 6] = s.color[2];
      written++;
    }
    frame.sparkCount = written;
  }

  private spawn(x: number, y: number, spread: number, outward: number, angle = Math.random() * Math.PI * 2): void {
    const s = this.params.sparks;
    if (this.sparks.length >= Math.min(s.max, SPARK_CAPACITY)) this.sparks.shift();
    const distance = Math.random() * spread;
    // 85 % pale / ivory, 15 % flame orange
    const color = Math.random() < s.orangeShare ? FLAME : Math.random() < 0.5 ? PALE : IVORY;
    this.sparks.push({
      x0: x + Math.cos(angle) * distance,
      y0: y + Math.sin(angle) * distance,
      vx: Math.cos(angle) * outward,
      rise: lerp(s.riseMin, s.riseMax, Math.random()),
      amp: 4 + Math.random() * 10,
      freq: 3 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      life: lerp(s.lifeMin, s.lifeMax, Math.random()),
      age: 0,
      size: 2 + Math.random() * 3.5,
      color,
    });
  }
}
