import { gsap } from './gsap';

/** Page scroll position and smoothed vertical velocity (px/s, positive when scrolling down). */
export const scrollState = { y: window.scrollY, velocity: 0 };

// Driven by scroll events: the frame ticker never reads scrollY (that would force a layout every frame).
let last = window.scrollY;
let pending = 0;

window.addEventListener(
  'scroll',
  () => {
    const y = window.scrollY;
    pending += y - last;
    last = y;
    scrollState.y = y;
  },
  { passive: true },
);

gsap.ticker.add((_time, deltaMs) => {
  const dt = Math.max(deltaMs, 1) / 1000;
  const raw = pending / dt;
  pending = 0;
  scrollState.velocity += (raw - scrollState.velocity) * (1 - Math.exp(-dt * 14));
  if (Math.abs(scrollState.velocity) < 0.5) scrollState.velocity = 0;
});

/** After a programmatic jump (page change) so it is not read as a scroll gesture. */
export function resetScrollVelocity(): void {
  last = window.scrollY;
  scrollState.y = last;
  scrollState.velocity = 0;
  pending = 0;
}
