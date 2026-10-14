/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_BOOKING_URL?: string;
  readonly PUBLIC_ANALYTICS_DOMAIN?: string;
  readonly PUBLIC_ANALYTICS_SRC?: string;
  readonly PUBLIC_DEMO_CONTENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Set once the main script has started, so the head failsafe does not uncover the page early. */
  __beReady?: boolean;
}
