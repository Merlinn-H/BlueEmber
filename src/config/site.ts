// Centralised site settings. Everything in square brackets is a placeholder to replace
// (the list is generated in PLACEHOLDERS.md by `npm run placeholders:check`).
import { demo } from '../lib/demo';

const env = import.meta.env;

export const site = {
  name: 'Blue Ember',
  tagline: 'Marketing, vidéo et tech pour les entreprises ambitieuses.',
  lang: 'fr',
  locale: 'fr_FR',

  city: '[VILLE]',
  email: '[EMAIL]',
  phone: '[TÉLÉPHONE]',
  address: '[ADRESSE]',
  responseDelay: demo('[DÉLAI]', 'delai'),
  social: {
    instagram: '[INSTAGRAM]',
    linkedin: '[LINKEDIN]',
  },

  /** Booking link (Calendly or equivalent). Empty: the "Réserver un créneau" button is hidden. */
  bookingUrl: (env.PUBLIC_BOOKING_URL ?? '').trim(),
  /** Receives the contact form and the newsletter. Empty: success is simulated in development. */
  formEndpoint: (env.PUBLIC_FORM_ENDPOINT ?? '').trim(),
  /** Cookie-free analytics (Plausible or equivalent). Disabled while the domain is empty. */
  analytics: {
    domain: (env.PUBLIC_ANALYTICS_DOMAIN ?? '').trim(),
    src: (env.PUBLIC_ANALYTICS_SRC ?? '').trim() || 'https://plausible.io/js/script.js',
  },

  /** Main call to action, used by the navigation, the hero and the closing blocks. */
  cta: { label: 'Prendre rendez-vous', href: '/contact' },

  nav: [
    { label: 'Agence', href: '/agence' },
    { label: 'Services', href: '/services' },
    { label: 'Réalisations', href: '/realisations' },
    { label: 'Contact', href: '/contact' },
  ],

  /** Optional looping hero video (disabled by default, darkened to 60 %). */
  heroVideo: {
    enabled: false,
    src: '[VIDEO-HERO]',
    mobileSrc: '',
    poster: '/placeholders/hero-video-poster-16x9.svg',
  },

  /** Film-grain jitter (a few pixels every 120 ms). Off by default. */
  grainJitter: false,

  legal: {
    companyName: '[RAISON SOCIALE]',
    legalForm: '[FORME]',
    capital: '[CAPITAL]',
    siren: '[SIREN]',
    address: '[ADRESSE]',
    publicationDirector: '[DIRECTEUR DE PUBLICATION]',
    host: '[HÉBERGEUR]',
    dpoEmail: '[EMAIL-DPO]',
  },

  /** Year displayed in the footer, computed at build time. */
  year: new Date().getFullYear(),
} as const;

export type Site = typeof site;
