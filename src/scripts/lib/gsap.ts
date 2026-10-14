import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// Design system curves: --ease-out-expo and --ease-in-out
CustomEase.create('expoOut', '0.16, 1, 0.3, 1');
CustomEase.create('inOut', '0.65, 0, 0.35, 1');

ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };

/** Resolves when a timeline or tween completes. */
export const done = (animation: gsap.core.Animation): Promise<void> =>
  new Promise((resolve) => {
    if (animation.progress() === 1) resolve();
    else animation.eventCallback('onComplete', () => resolve());
  });

export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves after `count` animation frames. */
export const frames = (count: number): Promise<void> =>
  new Promise((resolve) => {
    let left = count;
    const step = () => (--left <= 0 ? resolve() : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });
