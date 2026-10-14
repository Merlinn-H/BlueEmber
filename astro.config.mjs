import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Placeholder domain on the reserved .example TLD: replace via PUBLIC_SITE_URL.
const site = env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'https://blue-ember.example';

export default defineConfig({
  site,
  trailingSlash: 'never',
  // Astro 7 defaults to 'jsx' whitespace rules; 'true' keeps the usual HTML behaviour.
  compressHTML: true,
  // The whole CSS is under 7 KB gzip: inlining it removes the render-blocking stylesheet requests
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
});
