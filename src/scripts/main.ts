// Entry point of the client scripts. Bundled once by Astro; with the ClientRouter it is NOT re-run on
// navigation, so everything tied to a page's DOM lives in page modules mounted on astro:page-load.
//
// Startup is kept light on purpose: only the critical modules (navigation, hero entrance) are in this
// bundle. Everything else is a separate chunk, downloaded only on pages that need it, or started when the
// browser is idle, so no single long task blocks the main thread.
import './lib/scroll';
import { finePointer } from './lib/env';
import { lazyPage, whenIdle } from './lib/lazy';
import { mountPage } from './lib/lifecycle';
import { registerReadiness } from './lib/ready';
import { initSmooth } from './motion/smooth';
import { entrance, initTransitions } from './motion/transitions';

// Critical page modules register themselves on import
import './motion/nav';
import './motion/reveal';

window.__beReady = true;

initSmooth();
initTransitions();

// Page modules, loaded where their markup exists
lazyPage('[data-marquee]', () => import('./motion/marquee'));
lazyPage('[data-projects-section]', () => import('./motion/filters'));
lazyPage('form[data-form]', () => import('./motion/form'));
lazyPage('video[data-video], [data-hover-video]', () => import('./motion/video'));
if (finePointer()) lazyPage('[data-magnetic]', () => import('./motion/buttons'));

// Desktop pointer niceties and the ember effect start once the page is idle, and the preloader waits for
// the ember (shaders compiled), up to its 1.5 s ceiling. On touch devices the ember starts on the first
// touch or scroll instead, and the preloader does not wait for it: creating a WebGL context is the heaviest
// single call of the page (very slow on software rendering, as in PageSpeed Insights) and a phone only needs
// the effect once someone touches it.
const firstInteraction = (): Promise<void> =>
  new Promise((resolve) => {
    const events = ['touchstart', 'pointerdown', 'scroll', 'keydown'];
    const done = () => {
      for (const name of events) window.removeEventListener(name, done);
      resolve();
    };
    for (const name of events) window.addEventListener(name, done, { passive: true });
  });

const desktop = finePointer();
const emberStart = desktop ? new Promise<void>((resolve) => whenIdle(resolve, 600)) : firstInteraction();
const emberReady = emberStart.then(async () => {
  try {
    if (desktop) {
      const [{ initCursor }, { initAmbiance }] = await Promise.all([import('./motion/cursor'), import('./motion/ambiance')]);
      initCursor();
      initAmbiance();
    }
    const { initEmber } = await import('./ember');
    await initEmber()?.ready;
  } catch (error) {
    console.error('[ember]', error);
  }
});
registerReadiness(desktop ? emberReady : Promise.resolve());

document.addEventListener('astro:page-load', () => {
  void mountPage().then(() => entrance());
});
