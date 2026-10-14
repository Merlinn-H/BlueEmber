import { ScrollTrigger } from '../lib/gsap';

// The permanent fragment (brief 7.3): a DOM <img> inside the persistent stage. This module reads its rect for
// the rim light, loads its alpha mask for the shader, animates it between pages (900 ms ease-out-expo) and
// dims it by 30 % over long reading zones (CSS variable driven by ScrollTrigger).
export class FragmentTracker {
  /** x, y, w, h in CSS px. */
  readonly rect = new Float32Array(4);
  /** True while the page-change animation runs: the rect must then be read on every frame. */
  moving = false;
  private readonly element: HTMLImageElement | null;

  constructor(private readonly stage: HTMLElement) {
    this.element = stage.querySelector<HTMLImageElement>('[data-fragment]');
  }

  measure(): void {
    if (!this.element) return;
    const r = this.element.getBoundingClientRect();
    this.rect.set([r.left, r.top, r.width, r.height]);
  }

  /** The alpha mask as a small canvas (WebP alpha or the alpha SVG), used as a texture by the rim light. */
  async loadMask(): Promise<HTMLCanvasElement | null> {
    const source = this.element?.dataset.mask;
    if (!source) return null;
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
      await image.decode();
      const width = 192;
      const height = Math.round((width * (image.naturalHeight || 800)) / (image.naturalWidth || 600));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
      return canvas;
    } catch {
      return null;
    }
  }

  /** Call before the page swap: the transform the fragment has now. */
  snapshot(): string {
    return this.element ? getComputedStyle(this.element).transform : 'none';
  }

  /** Call after the swap: the new page's variables are in place, glide from the old transform to the new one. */
  glideFrom(before: string, animate: boolean): void {
    const element = this.element;
    if (!element) return;
    this.measure();
    const after = getComputedStyle(element).transform;
    if (!animate || before === 'none' || before === after) return;
    this.moving = true;
    const animation = element.animate([{ transform: before }, { transform: after }], {
      duration: 900,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    });
    void animation.finished
      .catch(() => undefined)
      .finally(() => {
        this.moving = false;
        this.measure();
      });
  }

  /** Dims the fragment (-30 %) while a long reading zone is on screen. Returns a teardown. */
  watchReadingZones(): () => void {
    let active = 0;
    const set = () => this.stage.style.setProperty('--fragment-light', active > 0 ? '0.7' : '1');
    const triggers = [...document.querySelectorAll<HTMLElement>('[data-ember="calm"]')]
      // Only blocks of real reading text, not one-line captions or the hero lead
      .filter((element) => element.offsetHeight >= 160)
      .map((element) =>
        ScrollTrigger.create({
          trigger: element,
          start: 'top 85%',
          end: 'bottom 15%',
          onToggle: (self) => {
            active += self.isActive ? 1 : -1;
            set();
          },
        }),
      );
    return () => {
      for (const trigger of triggers) trigger.kill();
      this.stage.style.setProperty('--fragment-light', '1');
    };
  }
}
