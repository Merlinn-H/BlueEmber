import { gsap } from '../lib/gsap';
import { clamp, damp, lerp } from '../lib/math';
import { isMobile, reduced } from '../lib/env';
import { scrollState } from '../lib/scroll';

// Auto-scrolling band (brief 6.4) used for the projects (40 px/s, 30 px/s on mobile) and the client
// logos (20 px/s). The list is duplicated once in the markup (the copy is aria-hidden and inert).
//  - rests at the base speed, right to left, in an endless loop
//  - page scroll: speed = base + scroll speed x 0.3; scrolling up reverses the direction; eases back in ~600 ms
//  - mouse over the band: slows to the hover speed (10 px/s) and drifts by up to +-60 px with the pointer
//  - drag with mouse or finger, with inertia on release
//  - paused while off screen; under prefers-reduced-motion the markup stays a hand-scrollable row
class Marquee {
  private readonly inner: HTMLElement;
  private readonly track: HTMLElement;
  private readonly speed: number;
  private readonly speedMobile: number;
  private readonly hoverSpeed: number;
  private readonly parallax: number;
  private readonly canDrag: boolean;
  private readonly boost: boolean;

  private loopWidth = 0;
  private x = 0;
  private velocity = 0; // px/s, negative = leftwards
  private offset = 0;
  private mouse = 0; // -1..1 across the band
  private hovering = false;
  private pressed = false;
  private dragging = false;
  private suppressClick = false;
  private startX = 0;
  private lastX = 0;
  private lastTime = 0;
  private dragVelocity = 0;
  private inertiaUntil = 0;
  private visible = true;
  /** Paused with the Pause button (WCAG 2.2.2). */
  paused = false;
  /** Paused while a card holds keyboard focus. */
  private focusPaused = false;
  private readonly cleanups: Array<() => void> = [];

  constructor(private readonly element: HTMLElement) {
    const inner = element.querySelector<HTMLElement>('[data-marquee-inner]');
    const track = element.querySelector<HTMLElement>('[data-marquee-track]');
    if (!inner || !track) throw new Error('marquee: missing markup');
    this.inner = inner;
    this.track = track;
    this.speed = Number(element.dataset.speed) || 40;
    this.speedMobile = Number(element.dataset.speedMobile) || this.speed;
    this.hoverSpeed = Number(element.dataset.hoverSpeed) || 0;
    this.parallax = Number(element.dataset.parallax) || 0;
    this.canDrag = element.dataset.drag !== undefined;
    this.boost = element.dataset.boost !== undefined;

    element.setAttribute('data-marquee-active', '');
    this.measure();

    const resize = new ResizeObserver(() => this.measure());
    resize.observe(this.track);
    const visibility = new IntersectionObserver(([entry]) => (this.visible = entry.isIntersecting), { rootMargin: '120px' });
    visibility.observe(element);
    this.cleanups.push(() => resize.disconnect(), () => visibility.disconnect());

    this.listen(element, 'pointerenter', (event) => {
      if ((event as PointerEvent).pointerType === 'mouse') this.hovering = true;
    });
    this.listen(element, 'pointerleave', () => (this.hovering = false));
    // Keyboard users: the band stops while a card is focused, so it cannot slide away under the focus ring
    this.listen(element, 'focusin', (event) => {
      this.focusPaused = (event.target as Element).matches(':focus-visible');
    });
    this.listen(element, 'focusout', () => (this.focusPaused = false));
    this.listen(element, 'pointermove', (event) => this.onMove(event as PointerEvent));
    this.listen(element, 'pointerdown', (event) => this.onDown(event as PointerEvent));
    this.listen(element, 'pointerup', (event) => this.onUp(event as PointerEvent));
    this.listen(element, 'pointercancel', (event) => this.onUp(event as PointerEvent));
    // A drag must never open the project under the pointer
    this.listen(
      element,
      'click',
      (event) => {
        if (!this.suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );

    gsap.ticker.add(this.tick);
  }

  private listen(target: HTMLElement, type: string, handler: (event: Event) => void, capture = false): void {
    target.addEventListener(type, handler, { capture, passive: capture ? false : true });
    this.cleanups.push(() => target.removeEventListener(type, handler, { capture }));
  }

  private measure(): void {
    this.loopWidth = this.track.offsetWidth;
  }

  private onMove(event: PointerEvent): void {
    if (event.pointerType === 'mouse') this.mouse = (event.clientX / window.innerWidth - 0.5) * 2;
    if (!this.pressed) return;
    if (!this.dragging) {
      if (Math.abs(event.clientX - this.startX) < 4) return;
      this.dragging = true;
      // Capture only once it is a real drag, so a plain click still reaches the link
      this.element.setPointerCapture(event.pointerId);
      this.element.setAttribute('data-dragging', '');
    }
    const dx = event.clientX - this.lastX;
    this.x += dx;
    const dt = Math.max(1, event.timeStamp - this.lastTime) / 1000;
    this.dragVelocity = lerp(this.dragVelocity, dx / dt, 0.4);
    this.lastX = event.clientX;
    this.lastTime = event.timeStamp;
  }

  private onDown(event: PointerEvent): void {
    if (!this.canDrag || (event.pointerType === 'mouse' && event.button !== 0)) return;
    this.pressed = true;
    this.dragging = false;
    this.startX = this.lastX = event.clientX;
    this.lastTime = event.timeStamp;
    this.dragVelocity = 0;
  }

  private onUp(event: PointerEvent): void {
    if (!this.pressed) return;
    this.pressed = false;
    if (!this.dragging) return;
    this.dragging = false;
    this.element.removeAttribute('data-dragging');
    if (this.element.hasPointerCapture(event.pointerId)) this.element.releasePointerCapture(event.pointerId);
    // Inertia: keep the release speed and let it fall back to the resting speed slowly
    this.velocity = clamp(this.dragVelocity, -2600, 2600);
    this.inertiaUntil = performance.now() + 1100;
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false), 0);
  }

  private readonly tick = (_time: number, deltaMs: number): void => {
    if (!this.visible || this.loopWidth <= 0) return;
    const dt = Math.min(deltaMs, 50) / 1000;

    if (!this.dragging) {
      const base = isMobile() ? this.speedMobile : this.speed;
      let magnitude = this.hovering && this.hoverSpeed > 0 ? this.hoverSpeed : base;
      let direction = -1;
      if (this.boost) {
        const scroll = scrollState.velocity;
        magnitude += Math.abs(scroll) * 0.3;
        if (scroll < -40) direction = 1; // scrolling up: the band runs the other way
      }
      const inertia = performance.now() < this.inertiaUntil;
      const halted = this.paused || this.focusPaused;
      this.velocity = damp(this.velocity, halted ? 0 : direction * magnitude, halted ? 8 : inertia ? 2.2 : 5, dt);
      this.x += this.velocity * dt;
    }

    // Mouse position drifts the band by up to +-parallax px (smoothed)
    const drift = this.hovering && this.parallax > 0 ? -this.mouse * this.parallax : 0;
    this.offset = damp(this.offset, drift, 6, dt);

    const L = this.loopWidth;
    this.x = ((this.x % L) - L) % L;
    const position = (((this.x + this.offset) % L) - L) % L;
    this.inner.style.transform = `translate3d(${position}px, 0, 0)`;
  };

  destroy(): void {
    gsap.ticker.remove(this.tick);
    for (const cleanup of this.cleanups) cleanup();
    this.element.removeAttribute('data-marquee-active');
    this.element.removeAttribute('data-dragging');
    this.inner.style.transform = '';
  }
}

export default function mount(): (() => void) | void {
  if (reduced()) return;
  const marquees = new Map<HTMLElement, Marquee>();
  for (const element of document.querySelectorAll<HTMLElement>('[data-marquee]')) marquees.set(element, new Marquee(element));

  // Pause buttons: each one controls the band of its own section
  const cleanups: Array<() => void> = [];
  for (const button of document.querySelectorAll<HTMLElement>('[data-marquee-pause]')) {
    const element = button.closest('section')?.querySelector<HTMLElement>('[data-marquee]');
    const marquee = element ? marquees.get(element) : undefined;
    if (!marquee) continue;
    const toggle = () => {
      marquee.paused = !marquee.paused;
      button.setAttribute('aria-pressed', String(marquee.paused));
    };
    button.addEventListener('click', toggle);
    cleanups.push(() => button.removeEventListener('click', toggle));
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
    for (const marquee of marquees.values()) marquee.destroy();
  };
}
