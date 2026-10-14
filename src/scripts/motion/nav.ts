import { gsap } from '../lib/gsap';
import { reduced } from '../lib/env';
import { onPage } from '../lib/lifecycle';
import { startScroll, stopScroll } from './smooth';

// Navigation: hides when scrolling down, comes back when scrolling up (brief 6.3), and the mobile
// full-screen menu with focus trap, Escape to close and aria-expanded.
onPage(() => {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const html = document.documentElement;
  const toggle = nav.querySelector<HTMLElement>('[data-menu-toggle]');
  const menu = nav.querySelector<HTMLElement>('[data-menu]');
  const links = [...nav.querySelectorAll<HTMLElement>('[data-menu-link]')];
  const cta = nav.querySelector<HTMLElement>('[data-menu-cta]');
  const label = toggle?.querySelector('.btn__label');

  let open = false;
  let timeline: gsap.core.Timeline | null = null;
  let lastY = window.scrollY;

  // --- Hide on scroll down, show on scroll up -------------------------------------------------
  const onScroll = () => {
    const y = window.scrollY;
    const dy = y - lastY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (!open) {
      if (y < 80 || dy < -6) nav.classList.remove('is-hidden');
      else if (dy > 6) nav.classList.add('is-hidden');
    }
    if (Math.abs(dy) > 6) lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ----------------------------------------------------------------------------
  const outside = () =>
    [document.getElementById('main'), document.querySelector<HTMLElement>('.site-footer'), document.querySelector<HTMLElement>('.skip-link')].filter(
      (el): el is HTMLElement => el !== null,
    );

  const focusables = () =>
    [...nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.getClientRects().length > 0);

  function openMenu() {
    if (!menu || !toggle || open) return;
    open = true;
    timeline?.kill();
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Fermer';
    nav!.classList.remove('is-hidden');
    html.classList.add('menu-open');
    stopScroll();
    for (const el of outside()) el.setAttribute('inert', '');

    const items = links.map((link) => link.querySelector('.menu__link-inner')).filter((el): el is Element => el !== null);
    if (reduced()) {
      gsap.set(menu, { opacity: 1 });
      gsap.set(items, { yPercent: 0 });
      if (cta) gsap.set(cta, { opacity: 1 });
    } else {
      timeline = gsap.timeline();
      timeline.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'inOut' }, 0);
      // The links rise one by one, 60 ms apart
      timeline.fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expoOut', stagger: 0.06 }, 0.12);
      if (cta) timeline.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 0.45);
    }
    links[0]?.focus();
  }

  function closeMenu({ restoreFocus = true, immediate = false, unlock = true } = {}) {
    if (!menu || !toggle || !open) return;
    open = false;
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    html.classList.remove('menu-open');
    for (const el of outside()) el.removeAttribute('inert');
    timeline?.kill();
    const finish = () => {
      menu.hidden = true;
      if (unlock) startScroll();
    };
    if (immediate || reduced()) finish();
    else timeline = gsap.timeline({ onComplete: finish }).to(menu, { opacity: 0, duration: 0.3, ease: 'inOut' });
    if (restoreFocus) toggle.focus();
  }

  toggle?.addEventListener('click', () => (open ? closeMenu() : openMenu()));

  const onKey = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    // Focus trap: Tab and Shift+Tab cycle inside the header while the menu is open
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKey);

  const desktop = window.matchMedia('(min-width: 900px)');
  const onBreakpoint = () => {
    if (desktop.matches) closeMenu({ restoreFocus: false, immediate: true });
  };
  desktop.addEventListener('change', onBreakpoint);

  return () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('keydown', onKey);
    desktop.removeEventListener('change', onBreakpoint);
    // The page is being swapped: tidy up without touching the scroll lock, the transition owns it
    closeMenu({ restoreFocus: false, immediate: true, unlock: false });
    timeline?.kill();
  };
}, { critical: true });
