import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { mqReduce, reduced } from '../lib/env';

// Smooth scrolling (brief 6.8). syncTouch stays false: touch devices keep native scrolling
// (the former smoothTouch: false). Disabled entirely under prefers-reduced-motion.
let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

function create(): void {
  if (lenis || reduced()) return;
  lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, syncTouch: false, autoRaf: false, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  // Lenis wants GSAP time to follow the clock, but a stalled frame (slow first paint, tab switch) must
  // not make animations jump to their end: stalls over 250 ms count as 33 ms.
  gsap.ticker.lagSmoothing(250, 33);
}

function destroy(): void {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
}

export function initSmooth(): void {
  create();
  mqReduce.addEventListener('change', () => (reduced() ? destroy() : create()));
}

const root = document.documentElement;

/** Locks scrolling (menu open, page transition). Works with or without Lenis. */
export function stopScroll(): void {
  lenis?.stop();
  root.classList.add('is-locked');
}

export function startScroll(): void {
  lenis?.start();
  root.classList.remove('is-locked');
}

/** After a page swap: adopt the native scroll position Astro just set and re-measure. */
export function syncScroll(): void {
  if (!lenis) return;
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
}

export const getLenis = (): Lenis | null => lenis;
