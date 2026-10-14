import { done, frames, gsap, wait } from '../lib/gsap';
import { reduced } from '../lib/env';
import { unmountPage } from '../lib/lifecycle';
import { whenAllReady } from '../lib/ready';
import { resetScrollVelocity } from '../lib/scroll';
import { startScroll, stopScroll, syncScroll } from './smooth';

// Page transition curtain (brief 6.9) and preloader (6.10), one persistent element.
//  - Navigation: the charbon curtain rises from the bottom (700 ms) with an incandescent edge, the logo
//    appears, the page is swapped underneath, then the curtain leaves through the top (500 ms): 1.2 s.
//  - First visit: the curtain is already closed at first paint; the logo's dot pulses while fonts,
//    shaders and the fragment load (600 ms minimum, 1.5 s maximum), then the curtain leaves.
//  - prefers-reduced-motion: a plain 200 ms fade (100 ms out, 100 ms in), no pulse.

const html = document.documentElement;
const PRELOADER_MIN = 600;
const PRELOADER_MAX = 1500;
// Curtain timings: in 650 ms + out 450 ms, which leaves room for the page swap under the 1.2 s ceiling
const IN = 0.65;
const OUT = 0.45;

let transitioning = false;
let entered = false;
const beforeSwapHooks: Array<() => void> = [];

/** Lets other modules (the ember effect) react while the curtain is closed. */
export const onCurtainClosed = (hook: () => void): void => {
  beforeSwapHooks.push(hook);
};

// Reveal gate: entrance animations wait for it so they play while the curtain leaves, not under it.
let openGate: () => void = () => undefined;
let gate: Promise<void> = new Promise<void>((resolve) => (openGate = resolve));
const closeGate = () => {
  gate = new Promise<void>((resolve) => (openGate = resolve));
};
export const whenRevealing = (): Promise<void> => gate;

function parts() {
  const root = document.querySelector<HTMLElement>('[data-curtain]');
  return {
    root,
    panel: root?.querySelector<HTMLElement>('[data-curtain-panel]') ?? null,
    logo: root?.querySelector<HTMLElement>('[data-curtain-logo]') ?? null,
  };
}

const showCurtain = (root: HTMLElement) => {
  root.style.visibility = 'visible';
  root.style.pointerEvents = 'auto';
};

const hideCurtain = (root: HTMLElement) => {
  root.style.visibility = 'hidden';
  root.style.pointerEvents = 'none';
};

async function curtainIn(): Promise<void> {
  const { root, panel, logo } = parts();
  if (!root || !panel) return;
  showCurtain(root);
  if (reduced()) {
    await done(gsap.fromTo(panel, { yPercent: 0, opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'none' }));
    return;
  }
  const timeline = gsap.timeline();
  if (logo) timeline.set(logo, { opacity: 0 }, 0);
  timeline.fromTo(panel, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: IN, ease: 'inOut' }, 0);
  if (logo) timeline.to(logo, { opacity: 1, duration: 0.3, ease: 'none' }, IN - 0.3);
  await done(timeline);
}

async function curtainOut(): Promise<void> {
  const { root, panel, logo } = parts();
  if (!root || !panel) {
    openGate();
    return;
  }
  const finish = () => {
    gsap.set(panel, { yPercent: 100, opacity: 1 });
    if (logo) gsap.set(logo, { opacity: 0 });
    hideCurtain(root);
  };
  if (reduced()) {
    await frames(2);
    openGate();
    await done(gsap.to(panel, { opacity: 0, duration: 0.1, ease: 'none' }));
    finish();
    return;
  }
  // The first frames of a page can be slow to render: start from a fresh GSAP tick, not a stale clock
  await frames(2);
  setTimeout(openGate, 160);
  const timeline = gsap.timeline();
  if (logo) timeline.to(logo, { opacity: 0, duration: 0.2, ease: 'none' }, 0);
  timeline.to(panel, { yPercent: -100, duration: OUT, ease: 'inOut' }, 0);
  await done(timeline);
  finish();
}

async function fontsReady(): Promise<void> {
  try {
    await Promise.all([document.fonts.load('500 1em "Bodoni Moda"'), document.fonts.load('400 1em "Instrument Sans"')]);
    await document.fonts.ready;
  } catch {
    // never block the entrance on a font problem
  }
}

async function fragmentReady(): Promise<void> {
  try {
    await document.querySelector<HTMLImageElement>('[data-fragment]')?.decode();
  } catch {
    // decode() rejects for broken images: the fragment is decorative
  }
}

/** Runs on every astro:page-load, after the page modules are mounted. */
export async function entrance(): Promise<void> {
  const mode = html.dataset.preload;
  if (mode) {
    const { root, panel, logo } = parts();
    if (root && panel) {
      showCurtain(root);
      gsap.set(panel, { yPercent: 0, opacity: 1 });
      if (logo) gsap.set(logo, { opacity: mode === 'first' ? 1 : 0 });
    }
    html.removeAttribute('data-preload');
    if (mode === 'first') {
      const critical = Promise.all([fontsReady(), fragmentReady(), whenAllReady()]);
      await Promise.all([wait(reduced() ? 150 : PRELOADER_MIN), Promise.race([critical, wait(PRELOADER_MAX)])]);
    } else {
      await Promise.race([fontsReady(), wait(500)]);
    }
    try {
      sessionStorage.setItem('be-seen', '1');
    } catch {
      // storage unavailable
    }
  } else {
    // Navigation: keyboard users land on the content, as after a normal page load
    document.getElementById('main')?.focus({ preventScroll: true });
  }
  resetScrollVelocity();
  await curtainOut();
  startScroll();
  transitioning = false;
  entered = true;
}

export function initTransitions(): void {
  document.addEventListener('astro:before-preparation', (event) => {
    if (transitioning) return;
    transitioning = true;
    closeGate();
    // Failsafe: never stay "in transition" if the page-load never comes
    setTimeout(() => (transitioning = false), 8000);
    const load = event.loader;
    event.loader = async () => {
      stopScroll();
      await Promise.all([curtainIn(), load()]);
      for (const hook of beforeSwapHooks) hook();
    };
  });

  document.addEventListener('astro:before-swap', (event) => {
    // Astro replaces the <html> attributes: keep ours (js, lenis, lenis-smooth...)
    const next = event.newDocument.documentElement;
    for (const name of html.classList) next.classList.add(name);
    unmountPage();
  });

  document.addEventListener('astro:after-swap', () => {
    syncScroll();
    resetScrollVelocity();
  });

  // If the first entrance never completes (an error somewhere), uncover the page anyway
  setTimeout(() => {
    if (entered) return;
    const { root } = parts();
    html.removeAttribute('data-preload');
    if (root) hideCurtain(root);
    openGate();
    startScroll();
    transitioning = false;
  }, 6000);
}
