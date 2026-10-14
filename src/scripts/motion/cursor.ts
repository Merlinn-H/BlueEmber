import { createLoop } from '../lib/loop';
import { lerpFactor } from '../lib/math';
import { finePointer, mqFine, mqReduce, reduced } from '../lib/env';

// Custom cursor (brief 6.7), desktop with a fine pointer only:
//  - ivory disc of 10 px, mix-blend-mode: difference, follows the mouse with lerp 0.2
//  - 40 px on links and buttons
//  - 88 px flame bubble labelled "Voir" on a project
//  - the system cursor stays on form fields
type Mode = 'idle' | 'hover' | 'view' | 'text';

const HOVER = 'a[href], button, [role="button"], summary, label[for], [data-cursor="hover"]';
const TEXT = 'input, textarea, select, [contenteditable="true"]';

export function initCursor(): void {
  const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
  const view = document.querySelector<HTMLElement>('[data-cursor-view]');
  if (!dot || !view) return;
  const html = document.documentElement;

  let enabled = false;
  let tx = -100;
  let ty = -100;
  let x = -100;
  let y = -100;
  let mode: Mode = 'idle';
  let dotScale = 0.25;
  let viewScale = 0;

  const loop = createLoop((dt) => {
    const move = lerpFactor(0.2, dt);
    const scale = lerpFactor(0.22, dt);
    x += (tx - x) * move;
    y += (ty - y) * move;
    const dotTarget = mode === 'idle' ? 0.25 : mode === 'hover' ? 1 : 0;
    const viewTarget = mode === 'view' ? 1 : 0;
    dotScale += (dotTarget - dotScale) * scale;
    viewScale += (viewTarget - viewScale) * scale;

    dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${dotScale})`;
    view.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${viewScale})`;
    view.style.opacity = viewScale > 0.02 ? '1' : '0';

    return (
      Math.abs(tx - x) > 0.1 ||
      Math.abs(ty - y) > 0.1 ||
      Math.abs(dotTarget - dotScale) > 0.005 ||
      Math.abs(viewTarget - viewScale) > 0.005
    );
  });

  const enable = () => {
    if (enabled) return;
    enabled = true;
    html.classList.add('cursor-on');
    dot.style.opacity = '1';
    x = tx;
    y = ty;
  };

  const disable = () => {
    if (!enabled) return;
    enabled = false;
    html.classList.remove('cursor-on');
    dot.style.opacity = '0';
    view.style.opacity = '0';
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse' || !finePointer() || reduced()) {
        disable();
        return;
      }
      tx = event.clientX;
      ty = event.clientY;
      enable();
      loop.start();
    },
    { passive: true },
  );

  document.addEventListener(
    'pointerover',
    (event) => {
      if (!enabled || !(event.target instanceof Element)) return;
      const target = event.target;
      mode = target.closest(TEXT)
        ? 'text'
        : target.closest('[data-cursor="view"]')
          ? 'view'
          : target.closest(HOVER)
            ? 'hover'
            : 'idle';
      loop.start();
    },
    { passive: true },
  );

  // The pointer left the window
  document.documentElement.addEventListener('pointerleave', () => {
    dot.style.opacity = '0';
    view.style.opacity = '0';
  });
  document.documentElement.addEventListener('pointerenter', () => {
    if (enabled) dot.style.opacity = '1';
  });

  // New page under a stationary pointer: nothing is hovered until it moves
  document.addEventListener('astro:after-swap', () => {
    mode = 'idle';
    loop.start();
  });

  mqFine.addEventListener('change', () => !finePointer() && disable());
  mqReduce.addEventListener('change', () => reduced() && disable());
}
