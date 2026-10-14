import { onPage } from './lifecycle';

type Mount = () => (() => void) | void;

/** A page module whose code is only downloaded and run on pages that contain `selector`. */
export function lazyPage(selector: string, load: () => Promise<{ default: Mount }>): void {
  onPage(async () => {
    if (!document.querySelector(selector)) return;
    const module = await load();
    return module.default();
  });
}

/** Runs `task` when the browser is idle (or after `timeout` ms at the latest). */
export function whenIdle(task: () => void, timeout = 1200): void {
  if ('requestIdleCallback' in window) window.requestIdleCallback(task, { timeout });
  else setTimeout(task, 200);
}
