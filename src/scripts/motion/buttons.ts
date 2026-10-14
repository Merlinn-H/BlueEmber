import { gsap } from '../lib/gsap';
import { clamp } from '../lib/math';
import { finePointer, reduced } from '../lib/env';

// Magnetic buttons (brief 6.2): on desktop a button follows the mouse by 6 px at most when the
// pointer is within 40 px of it.
const RANGE = 40;
const MAX = 6;

export default function mount(): (() => void) | void {
  if (reduced() || !finePointer()) return;

  const buttons = [...document.querySelectorAll<HTMLElement>('[data-magnetic]')].map((element) => ({
    element,
    x: gsap.quickTo(element, 'x', { duration: 0.45, ease: 'expoOut' }),
    y: gsap.quickTo(element, 'y', { duration: 0.45, ease: 'expoOut' }),
    tx: 0,
    ty: 0,
  }));
  if (buttons.length === 0) return;

  let frame = 0;
  let pointer: { x: number; y: number } | null = null;

  const update = () => {
    frame = 0;
    if (!pointer) return;
    for (const button of buttons) {
      const rect = button.element.getBoundingClientRect();
      // Remove the current offset so the centre is the resting centre, not the moved one
      const left = rect.left - button.tx;
      const top = rect.top - button.ty;
      const dx = Math.max(left - pointer.x, 0, pointer.x - (left + rect.width));
      const dy = Math.max(top - pointer.y, 0, pointer.y - (top + rect.height));
      let nextX = 0;
      let nextY = 0;
      if (Math.hypot(dx, dy) < RANGE) {
        nextX = clamp((pointer.x - (left + rect.width / 2)) * 0.25, -MAX, MAX);
        nextY = clamp((pointer.y - (top + rect.height / 2)) * 0.25, -MAX, MAX);
      }
      if (nextX !== button.tx || nextY !== button.ty) {
        button.tx = nextX;
        button.ty = nextY;
        button.x(nextX);
        button.y(nextY);
      }
    }
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onLeave = () => {
    pointer = { x: -9999, y: -9999 };
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);

  return () => {
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    cancelAnimationFrame(frame);
    for (const button of buttons) gsap.set(button.element, { clearProps: 'transform' });
  };
}
