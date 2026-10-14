import { emberDefaults, type EmberParams } from '../../config/ember';
import { finePointer, mqReduce, reduced, saveData } from '../lib/env';
import { onPage } from '../lib/lifecycle';
import { createLoop } from '../lib/loop';
import { damp } from '../lib/math';
import { onCurtainClosed } from '../motion/transitions';
import { Canvas2DRenderer } from './canvas2d';
import { FragmentTracker } from './fragment';
import { EmberSim } from './sim';
import { createFrameData, type EmberRenderer, type EmberTier, type RendererAssets } from './types';
import { WebGLRenderer } from './webgl';
import { ZoneTracker } from './zones';

// "The ember that reveals itself" (brief 7). One persistent canvas for the whole site.
//
// Tiers, decided at start (7.7): prefers-reduced-motion or data saver -> static (Ambiance + fragment only);
// WebGL2 -> webgl; otherwise -> canvas2d; if that fails too -> static. If the frame rate stays under
// 45 fps for 2 s the render resolution drops to 0.35x, then the effect moves to canvas2d.
// The render loop stops by itself when the trail is out, no spark is alive and nothing moved for 2.5 s:
// at rest the GPU does no work at all.

export interface EmberApi {
  readonly params: EmberParams;
  readonly tier: EmberTier;
  readonly fps: number;
  readonly scale: number;
  /** When false the frame-rate watchdog does not lower the quality (debug). */
  autoQuality: boolean;
  burst(): void;
  clear(): void;
  setTier(tier: EmberTier): Promise<void>;
  setScale(scale: number): void;
  wake(): void;
}

export interface EmberHandle {
  api: EmberApi;
  /** Resolves once the renderer is built (shaders compiled, fragment mask loaded) or has given up. */
  ready: Promise<void>;
}

let api: EmberApi | null = null;
export const getEmber = (): EmberApi | null => api;

const INTERACTIVE = 'a, button, input, textarea, select, summary, label, [role="button"], [data-cursor]';

async function loadCracks(url: string | undefined): Promise<HTMLImageElement | null> {
  if (!url) return null;
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

export function initEmber(): EmberHandle | null {
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  const firstCanvas = stage?.querySelector<HTMLCanvasElement>('[data-ember-canvas]');
  if (!stage || !firstCanvas) return null;

  let canvas = firstCanvas;
  const params: EmberParams = structuredClone(emberDefaults);
  const frame = createFrameData(params);
  const sim = new EmberSim(params);
  const zones = new ZoneTracker();
  const fragment = new FragmentTracker(stage);

  let tier: EmberTier = 'static';
  let renderer: EmberRenderer | null = null;
  let assets: RendererAssets = { mask: null, cracks: null };
  let scale = params.render.scale;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, params.render.dprMax);

  let pageIntensity = 1;
  let radiusScale = 1;
  let intensity = 1;
  const origin = performance.now();

  let hero: HTMLElement | null = null;
  let heroVisible = false;
  // Hero position in document coordinates, measured on layout changes (never read per frame)
  let heroTop = 0;
  let heroHeight = 0;
  // The touch "breathing" waits a little after a page appears, so it never competes with the entrance
  let breathingFrom = 0;
  let lastTouch = -1e9;

  let fps = 60;
  let fpsTime = 0;
  let fpsFrames = 0;
  let warmup = 0;

  // --- Renderer lifecycle ----------------------------------------------------------------------
  // A canvas cannot switch context type, so every renderer gets a fresh element.
  async function build(kind: 'webgl' | 'canvas2d'): Promise<boolean> {
    renderer?.destroy();
    renderer = null;
    const next = document.createElement('canvas');
    next.className = canvas.className;
    next.setAttribute('data-ember-canvas', '');
    canvas.replaceWith(next);
    canvas = next;

    const candidate = kind === 'webgl' ? WebGLRenderer.create(canvas) : Canvas2DRenderer.create(canvas);
    if (!candidate) return false;
    // Creating the context is the heaviest single call: keep it in a task of its own
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    try {
      await candidate.init(assets);
      candidate.resize(width, height, dpr, scale);
    } catch (error) {
      console.warn('[ember]', error);
      candidate.destroy();
      return false;
    }
    if (candidate instanceof WebGLRenderer) candidate.onContextLost = () => void downgrade();
    renderer = candidate;
    tier = kind;
    return true;
  }

  async function boot(): Promise<void> {
    if (reduced() || saveData()) {
      tier = 'static';
      return;
    }
    const [mask, cracks] = await Promise.all([fragment.loadMask(), loadCracks(stage?.dataset.cracks)]);
    assets = { mask, cracks };
    if (await build('webgl')) return;
    if (await build('canvas2d')) return;
    tier = 'static';
  }

  function goStatic(): void {
    loop.stop();
    renderer?.clear();
    renderer?.destroy();
    renderer = null;
    tier = 'static';
  }

  async function downgrade(): Promise<void> {
    loop.stop();
    if (tier === 'webgl' && (await build('canvas2d'))) return;
    goStatic();
  }

  // --- Frame loop --------------------------------------------------------------------------------
  const loop = createLoop((dt, now) => {
    if (!renderer || tier === 'static') return false;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Touch: with no finger on the screen, a point drifts along a slow Lissajous curve in the hero
    const breathing = heroVisible && hero !== null && now > breathingFrom && now - lastTouch > 1500;
    if (breathing) {
      const t = now / 1000;
      sim.push(
        width * (0.5 + 0.3 * Math.sin(t * 0.37)),
        heroTop - scrollY + heroHeight * (0.5 + 0.22 * Math.sin(t * 0.53 + 1.1)),
        now,
        width,
        radiusScale,
        0.3,
      );
    }

    intensity = damp(intensity, zones.intensityAt(scrollY, height, pageIntensity), 5, dt);
    frame.time = ((now - origin) / 1000) % 1800;
    frame.dt = dt;
    frame.width = width;
    frame.height = height;
    frame.intensity = intensity;
    frame.decay = Math.exp(-dt / params.trail.tau);

    sim.step(frame, dt, now);
    zones.fill(frame, scrollX, scrollY, height, params);
    if (fragment.moving) fragment.measure();
    frame.fragment.set(fragment.rect);

    renderer.render(frame);

    // Frame-rate watchdog (active frames only, after a short warm-up)
    if (warmup > 0) warmup--;
    else {
      fpsTime += dt;
      fpsFrames++;
      if (fpsTime >= 2) {
        fps = fpsFrames / fpsTime;
        fpsTime = 0;
        fpsFrames = 0;
        if (fps < params.render.fpsFloor && state.autoQuality) void lowerQuality();
      }
    }

    // Stop when the trail is out, no spark or ring is alive and nothing moved for a while
    const idle =
      now - sim.lastInput > params.render.idleMs &&
      sim.energy(now) < 0.004 &&
      sim.sparks.length === 0 &&
      sim.burstCount === 0 &&
      !breathing &&
      !fragment.moving;
    if (idle) {
      renderer.clear();
      return false;
    }
    return true;
  });

  function wake(): void {
    if (!renderer || tier === 'static' || document.hidden) return;
    if (!loop.running) {
      fpsTime = 0;
      fpsFrames = 0;
      warmup = 15;
    }
    loop.start();
  }

  async function lowerQuality(): Promise<void> {
    if (tier === 'webgl' && scale > params.render.minScale + 0.001) {
      scale = params.render.minScale;
      renderer?.resize(width, height, dpr, scale);
      fpsTime = 0;
      fpsFrames = 0;
      return;
    }
    if (tier === 'webgl') {
      await downgrade();
      return;
    }
    // canvas2d is the last tier: it only gives way to the static scene when frames are really bad
    if (fps < 30) goStatic();
  }

  // --- Input ---------------------------------------------------------------------------------------
  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      if (!renderer || tier === 'static') return;
      sim.push(event.clientX, event.clientY, performance.now(), width, radiusScale);
      wake();
    },
    { passive: true },
  );

  // The finger replaces the mouse during touchmove. Passive listeners: the page scroll is never blocked.
  window.addEventListener('touchstart', () => {
    lastTouch = performance.now();
    sim.breakStroke();
  }, { passive: true });
  window.addEventListener(
    'touchmove',
    (event) => {
      const touch = event.touches[0];
      if (!touch || !renderer || tier === 'static') return;
      lastTouch = performance.now();
      sim.push(touch.clientX, touch.clientY, lastTouch, width, radiusScale);
      wake();
    },
    { passive: true },
  );
  window.addEventListener('touchend', () => {
    lastTouch = performance.now();
    sim.breakStroke();
  }, { passive: true });

  // Click: the "breath". Not on links and buttons.
  window.addEventListener(
    'pointerdown',
    (event) => {
      if (!renderer || tier === 'static') return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
      sim.burst(event.clientX, event.clientY, performance.now());
      wake();
    },
    { passive: true },
  );

  // --- Layout, visibility, preferences -------------------------------------------------------------
  const measureHero = () => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    heroTop = rect.top + window.scrollY;
    heroHeight = rect.height;
  };

  let measurePending = 0;
  const scheduleMeasure = () => {
    if (measurePending) return;
    measurePending = requestAnimationFrame(() => {
      measurePending = 0;
      zones.measure(params);
      fragment.measure();
      measureHero();
    });
  };

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, params.render.dprMax);
      renderer?.resize(width, height, dpr, scale);
      scheduleMeasure();
    }, 120);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) loop.stop();
  });

  mqReduce.addEventListener('change', () => {
    if (reduced()) goStatic();
    else void boot();
  });

  // --- Pages -------------------------------------------------------------------------------------
  onPage(() => {
    pageIntensity = Number(document.body.dataset.emberIntensity ?? 1);
    radiusScale = Number(document.body.dataset.emberRadius ?? 1);
    hero = document.querySelector<HTMLElement>('[data-ember-hero]');
    heroVisible = false;
    breathingFrom = performance.now() + 2500;
    zones.measure(params);
    fragment.measure();
    measureHero();
    const stopDimming = fragment.watchReadingZones();

    const observer = new ResizeObserver(scheduleMeasure);
    const main = document.getElementById('main');
    if (main) observer.observe(main);
    void document.fonts.ready.then(scheduleMeasure);
    let visibility: IntersectionObserver | null = null;
    if (hero && !finePointer()) {
      visibility = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) wake();
      });
      visibility.observe(hero);
    }

    return () => {
      stopDimming();
      observer.disconnect();
      visibility?.disconnect();
      hero = null;
      heroVisible = false;
    };
  });

  // The fragment glides to its place on the new page (900 ms ease-out-expo)
  let transformBefore = 'none';
  document.addEventListener('astro:before-swap', () => {
    transformBefore = fragment.snapshot();
  });
  document.addEventListener('astro:after-swap', () => {
    fragment.glideFrom(transformBefore, !reduced());
    scheduleMeasure();
  });

  // The trail buffer is emptied while the page-transition curtain is closed
  onCurtainClosed(() => {
    sim.reset();
    renderer?.clear();
  });

  const ready = boot();

  const state = {
    autoQuality: true,
  };

  api = {
    params,
    get tier() {
      return tier;
    },
    get fps() {
      return fps;
    },
    get scale() {
      return scale;
    },
    get autoQuality() {
      return state.autoQuality;
    },
    set autoQuality(value: boolean) {
      state.autoQuality = value;
    },
    burst() {
      sim.burst(width * 0.5, height * 0.5, performance.now());
      wake();
    },
    clear() {
      sim.reset();
      renderer?.clear();
    },
    async setTier(next: EmberTier) {
      loop.stop();
      if (next === 'static') goStatic();
      else if (!(await build(next))) goStatic();
    },
    setScale(next: number) {
      scale = next;
      renderer?.resize(width, height, dpr, scale);
    },
    wake,
  };

  if (new URLSearchParams(window.location.search).has('debug')) {
    // window.__ember is a handle for the console and for automated checks
    Object.assign(window, { __ember: api });
    void import('./debug').then((module) => api && module.mountDebug(api));
  }
  return { api, ready };
}
