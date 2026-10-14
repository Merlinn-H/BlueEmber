import { gsap, ScrollTrigger } from '../lib/gsap';
import { reduced } from '../lib/env';

// Réalisations filters (brief 9.3): Tous, Vidéo, Marketing, Tech. aria-pressed buttons, filtering without
// a reload, state kept in the URL (?type=).
const TYPES = ['all', 'video', 'marketing', 'tech'];

export default function mount(): (() => void) | void {
  const root = document.querySelector<HTMLElement>('[data-projects-section]');
  if (!root) return;
  const buttons = [...root.querySelectorAll<HTMLElement>('[data-filter]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-projects] > li')];
  const status = root.querySelector<HTMLElement>('[data-filter-status]');

  const apply = (type: string, announce: boolean) => {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === type));
    const visible: HTMLElement[] = [];
    for (const item of items) {
      const show = type === 'all' || item.dataset.type === type;
      item.hidden = !show;
      if (show) visible.push(item);
    }
    if (announce) {
      if (status) status.textContent = `${visible.length} réalisation${visible.length > 1 ? 's' : ''} affichée${visible.length > 1 ? 's' : ''}`;
      if (!reduced()) {
        gsap.fromTo(
          visible,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'expoOut', stagger: 0.05, clearProps: 'opacity,transform' },
        );
      }
    }
    // Keep the URL in sync without adding history entries or dropping the router's state
    const url = new URL(window.location.href);
    if (type === 'all') url.searchParams.delete('type');
    else url.searchParams.set('type', type);
    history.replaceState({ ...(history.state as object | null) }, '', url);
    ScrollTrigger.refresh();
  };

  const initial = new URL(window.location.href).searchParams.get('type');
  if (initial && TYPES.includes(initial) && initial !== 'all') apply(initial, false);

  const onClick = (event: Event) => {
    const type = (event.currentTarget as HTMLElement).dataset.filter ?? 'all';
    apply(type, true);
  };
  for (const button of buttons) button.addEventListener('click', onClick);

  return () => {
    for (const button of buttons) button.removeEventListener('click', onClick);
  };
}
