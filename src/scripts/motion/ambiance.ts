import { createLoop } from '../lib/loop';
import { lerpFactor } from '../lib/math';
import { reduced } from '../lib/env';

// The two glows of the Ambiance follow the mouse by 20 px at most, in opposite directions,
// smoothed with lerp 0.05 (brief 6.1). Transform only; the loop stops once the glows settle.
const MAX = 20;

export function initAmbiance(): void {
  const cool = document.querySelector<HTMLElement>('[data-glow="cool"]');
  const warm = document.querySelector<HTMLElement>('[data-glow="warm"]');
  if (!cool || !warm) return;

  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;

  const loop = createLoop((dt) => {
    const factor = lerpFactor(0.05, dt);
    x += (tx - x) * factor;
    y += (ty - y) * factor;
    cool.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    warm.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
    return Math.abs(tx - x) > 0.02 || Math.abs(ty - y) > 0.02;
  });

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' || reduced()) return;
      tx = (event.clientX / window.innerWidth - 0.5) * 2 * MAX;
      ty = (event.clientY / window.innerHeight - 0.5) * 2 * MAX;
      loop.start();
    },
    { passive: true },
  );
}
