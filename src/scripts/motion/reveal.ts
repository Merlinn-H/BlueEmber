import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { reduced } from '../lib/env';
import { onPage } from '../lib/lifecycle';
import { whenRevealing } from './transitions';

// Entrance animations (brief 6.6):
//  - [data-split]: titles split into lines (SplitText), each line rises from 100% to 0 inside a mask,
//    900 ms ease-out-expo, 80 ms apart, triggered at 85% of the viewport height.
//  - [data-reveal]: fade 0 to 1 and rise by 24 px, 600 ms. Optional data-reveal-delay (seconds).
//  - [data-count]: real numbers count up when they appear (placeholders are left as they are).
// Content already on screen at load plays as soon as the curtain starts to leave; the rest waits for the
// 85% line. Under prefers-reduced-motion titles are not split and everything is a 200 ms fade.
// Performance: all layout reads happen before any write, and the many small [data-reveal] items share one
// IntersectionObserver instead of one ScrollTrigger each.
const START = 'top 85%';
const LINE = 0.85;

onPage(
  () => {
    const motion = !reduced();
    const gate = whenRevealing();
    const splits: SplitText[] = [];
    const cleanups: Array<() => void> = [];

    const titles = [...document.querySelectorAll<HTMLElement>('[data-split]')];
    const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const counters = motion ? [...document.querySelectorAll<HTMLElement>('[data-count]')] : [];

    // --- Reads: one layout pass --------------------------------------------------------------------
    const viewport = window.innerHeight;
    const onScreen = (element: Element) => element.getBoundingClientRect().top < viewport * 0.98;
    const titleOn = titles.map(onScreen);
    const itemOn = items.map(onScreen);
    const counterOn = counters.map(onScreen);

    const context = gsap.context(() => {
      // --- Titles -----------------------------------------------------------------------------------
      titles.forEach((element, index) => {
        const delay = Number(element.dataset.revealDelay) || 0;

        if (!motion) {
          gsap.set(element, { opacity: 0 });
          const show = () => void gate.then(() => gsap.to(element, { opacity: 1, duration: 0.2, ease: 'none' }));
          if (titleOn[index]) show();
          else ScrollTrigger.create({ trigger: element, start: START, once: true, onEnter: show });
          return;
        }

        let current: gsap.core.Tween | null = null;
        let played = false;
        const split = SplitText.create(element, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          // aria-label is only valid on elements with a role: headings get it, paragraphs and quotes do not
          aria: /^H[1-6]$/.test(element.tagName) ? 'auto' : 'none',
          onSplit: (self) => {
            // A re-split (resize, fonts) returns a new animation that SplitText fast-forwards to the old progress
            current = gsap.from(self.lines, { yPercent: 100, duration: 0.9, ease: 'expoOut', stagger: 0.08, delay, paused: !played });
            return current;
          },
        });
        splits.push(split);

        const play = () =>
          void gate.then(() => {
            played = true;
            current?.play();
          });
        if (titleOn[index]) play();
        else ScrollTrigger.create({ trigger: element, start: START, once: true, onEnter: play });
      });

      // --- Paragraphs, cards, figures ---------------------------------------------------------------
      gsap.set(items, { opacity: 0, y: motion ? 24 : 0 });

      const reveal = (targets: HTMLElement[]) =>
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: motion ? 0.6 : 0.2,
          ease: motion ? 'expoOut' : 'none',
          stagger: motion ? 0.08 : 0,
          delay: (_index: number, target: HTMLElement) => (motion ? Number(target.dataset.revealDelay) || 0 : 0),
          clearProps: 'transform',
        });

      const immediate = items.filter((_, i) => itemOn[i]);
      if (immediate.length > 0) void gate.then(() => reveal(immediate));

      // Items below the fold: revealed in small batches as they cross the 85% line
      const later = items.filter((_, i) => !itemOn[i]);
      if (later.length > 0) {
        const queue: HTMLElement[] = [];
        let timer = 0;
        const flush = () => {
          timer = 0;
          const batch = queue.splice(0);
          void gate.then(() => reveal(batch));
        };
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              queue.push(entry.target as HTMLElement);
              observer.unobserve(entry.target);
            }
            if (queue.length > 0 && !timer) timer = window.setTimeout(flush, 70);
          },
          { rootMargin: `0px 0px -${Math.round((1 - LINE) * 100)}% 0px` },
        );
        later.forEach((element) => observer.observe(element));
        cleanups.push(() => {
          observer.disconnect();
          window.clearTimeout(timer);
        });
      }

      // --- Counters ---------------------------------------------------------------------------------
      counters.forEach((element, index) => {
        const original = element.textContent?.trim() ?? '';
        const match = original.match(/^(\D*)(\d+(?:[.,]\d+)?)([\s\S]*)$/);
        if (!match) return;
        const [, prefix, digits, suffix] = match;
        const decimals = (digits.split(/[.,]/)[1] ?? '').length;
        const comma = digits.includes(',');
        const target = Number(digits.replace(',', '.'));
        const format = (value: number) => {
          const text = value.toFixed(decimals);
          return `${prefix}${comma ? text.replace('.', ',') : text}${suffix}`;
        };
        const state = { value: 0 };
        element.setAttribute('aria-label', original);
        element.textContent = format(0);
        const count = () =>
          void gate.then(() =>
            gsap.to(state, {
              value: target,
              duration: 1.4,
              ease: 'expoOut',
              onUpdate: () => {
                element.textContent = format(state.value);
              },
            }),
          );
        if (counterOn[index]) count();
        else ScrollTrigger.create({ trigger: element, start: START, once: true, onEnter: count });
      });
    });

    // Fonts change line breaks: measure the remaining triggers again once they are in
    if (ScrollTrigger.getAll().length > 0) void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => {
      for (const cleanup of cleanups) cleanup();
      for (const split of splits) split.revert();
      context.revert();
    };
  },
  { critical: true },
);
