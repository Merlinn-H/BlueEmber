// Checks the built site (dist/) for the SEO and structure rules of the brief (section 12).
// Usage: npm run build && npm run seo:check
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
if (!existsSync(dist)) {
  console.error('dist/ not found: run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const pages = walk(dist).filter((file) => file.endsWith('.html'));
let failures = 0;
const fail = (page, message) => {
  failures++;
  console.log(`  FAIL  ${page}: ${message}`);
};

const expectedJsonLd = {
  '/': ['ProfessionalService'],
  '/services': ['FAQPage'],
  '/agence': ['ProfessionalService'],
  '/contact': ['ProfessionalService'],
};

for (const file of pages) {
  const page = '/' + relative(dist, file).split(sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
  const route = page === '/' ? '/' : page;
  const html = readFileSync(file, 'utf8');

  if (!/<html[^>]*\blang="fr"/.test(html)) fail(route, 'missing lang="fr"');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) fail(route, 'missing <title>');
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!description) fail(route, 'missing meta description');
  else if (description.length < 50 || description.length > 200) fail(route, `description length ${description.length}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!canonical || !/^https?:\/\//.test(canonical)) fail(route, 'missing or relative canonical');
  for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
    if (!new RegExp(`<meta property="${tag}"`).test(html)) fail(route, `missing ${tag}`);
  }
  if (!/<meta name="twitter:card" content="summary_large_image"/.test(html)) fail(route, 'missing twitter:card');

  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) fail(route, `${h1s} <h1> (expected 1)`);

  // Heading levels never skip a level going down
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      fail(route, `heading jumps from h${levels[i - 1]} to h${levels[i]}`);
      break;
    }
  }

  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(img[0])) fail(route, `image without alt: ${img[0].slice(0, 80)}`);
  }

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const types = [];
  for (const block of blocks) {
    try {
      types.push(JSON.parse(block)['@type']);
    } catch {
      fail(route, 'invalid JSON-LD');
    }
  }
  const wanted = route.startsWith('/realisations/') ? ['BreadcrumbList', 'CreativeWork'] : (expectedJsonLd[route] ?? []);
  for (const type of wanted) if (!types.includes(type)) fail(route, `missing JSON-LD ${type}`);

  console.log(`  ok    ${route.padEnd(30)} h1=${h1s}  jsonld=[${types.join(', ')}]  title="${(title ?? '').slice(0, 60)}"`);
}

// Sitemap and robots
const sitemapIndex = join(dist, 'sitemap-index.xml');
const robots = join(dist, 'robots.txt');
if (!existsSync(sitemapIndex)) fail('sitemap', 'sitemap-index.xml missing');
if (!existsSync(robots)) fail('robots', 'robots.txt missing');
else if (!/Sitemap:/.test(readFileSync(robots, 'utf8'))) fail('robots', 'no Sitemap line');
const sitemap = existsSync(join(dist, 'sitemap-0.xml')) ? readFileSync(join(dist, 'sitemap-0.xml'), 'utf8') : '';
const urls = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
console.log(`\n  sitemap: ${urls.length} URLs${urls.some((u) => u.includes('404')) ? ' (contains 404!)' : ', 404 excluded'}`);
if (urls.some((u) => u.includes('404'))) fail('sitemap', '404 listed');

if (failures > 0) {
  console.error(`\n${failures} problem(s).`);
  process.exit(1);
}
console.log('\nSEO structure checks pass.');
