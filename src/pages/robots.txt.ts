import type { APIRoute } from 'astro';
import { demoEnabled } from '../lib/demo';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  // Demo mode: the figures and names are made up, so nothing should be crawled
  const rule = demoEnabled ? 'Disallow: /' : 'Allow: /';
  return new Response(`User-agent: *\n${rule}\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
