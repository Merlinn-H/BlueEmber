// Page modules: functions that set up behaviour for the current page and return a teardown.
// The site uses the Astro ClientRouter, so module scripts run once; everything tied to the DOM of a
// page is registered here, mounted on astro:page-load and torn down on astro:before-swap.
//  - `critical` modules run first and together (navigation, hero entrance): mountPage() resolves after them.
//  - the others run afterwards, one task each, so no single long task blocks the main thread.
//  - a module registered late (lazy chunk) is started at once for the page that is already mounted.
type Teardown = () => void;
type PageModule = () => Teardown | void | Promise<Teardown | void>;

interface Entry {
  module: PageModule;
  critical: boolean;
}

const entries: Entry[] = [];
const teardowns: Teardown[] = [];
let generation = 0;
let mounted = false;

const yieldToMain = (): Promise<void> => {
  const scheduler = (window as Window & { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return scheduler?.yield ? scheduler.yield() : new Promise((resolve) => setTimeout(resolve, 0));
};

async function run(entry: Entry, gen: number): Promise<void> {
  try {
    const teardown = await entry.module();
    if (typeof teardown !== 'function') return;
    // The page may have been swapped while an async module was still loading
    if (gen !== generation) teardown();
    else teardowns.push(teardown);
  } catch (error) {
    console.error('[page module]', error);
  }
}

export function onPage(module: PageModule, { critical = false } = {}): void {
  const entry = { module, critical };
  entries.push(entry);
  if (mounted) void run(entry, generation);
}

export function unmountPage(): void {
  generation++;
  mounted = false;
  for (const teardown of teardowns.splice(0)) {
    try {
      teardown();
    } catch (error) {
      console.error('[page teardown]', error);
    }
  }
}

/** Resolves once the critical modules are mounted; the rest keeps mounting in the background. */
export async function mountPage(): Promise<void> {
  unmountPage();
  mounted = true;
  const gen = generation;
  for (const entry of entries.filter((e) => e.critical)) await run(entry, gen);
  void (async () => {
    for (const entry of entries.filter((e) => !e.critical)) {
      await yieldToMain();
      if (gen !== generation) return;
      await run(entry, gen);
    }
  })();
}
