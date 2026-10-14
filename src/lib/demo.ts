// Demo content. While the real texts are missing, the [BRACKETED] placeholders that remain in the source are shown as
// lorem ipsum and made-up figures, so the design can be judged with content of a realistic length.
//  - Real content is never touched: only bracketed placeholders are replaced, and nothing is written to the sources.
//  - PUBLIC_DEMO_CONTENT=0 shows the placeholders as they are (and lets npm run placeholders:check say what is left).
//  - Names are lorem words on purpose: nothing here may pass for a real person, client or result.
//  - Identity and contact placeholders (city, e-mail, phone, address, social links, legal details) are left alone.
//  - In demo mode the site is also served as noindex (Seo.astro, robots.txt.ts): the figures are not real.

/** Demo mode is on unless PUBLIC_DEMO_CONTENT=0. */
export const demoEnabled = import.meta.env.PUBLIC_DEMO_CONTENT !== '0';

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna ' +
  'aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute ' +
  'irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non ' +
  'proident sunt culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

const PROJECTS = ['Lorem Ipsum', 'Dolor Sit', 'Amet Elit', 'Consectetur', 'Adipiscing', 'Tempor Magna'];
const CLIENTS = ['Lorem & Fils', 'Ipsum Group', 'Dolor Studio', 'Amet Conseil', 'Elit Industrie', 'Sed Habitat'];
const PEOPLE = ['Lorem Ipsum', 'Dolor Sit', 'Amet Elit', 'Sed Tempor', 'Magna Aliqua', 'Nisi Ullamco'];
const TEAM_ROLES = ['Fondateur et directeur', 'Directrice de création', 'Responsable de production', 'Développeur senior'];
const ROLES = ['Directrice marketing', 'Directeur général', 'Responsable communication'];
const CREDIT_ROLES = ['Direction artistique', 'Réalisation', 'Production', 'Stratégie', 'Développement', 'Montage'];
const SECTORS = ['Industrie', 'Santé', 'Distribution', 'Énergie', 'Finance', 'Immobilier'];
const YEARS = ['2025', '2024', '2024', '2023', '2025', '2023'];
const PERCENTS = [45, 120, 68, 32, 85, 150];
const COUNTS = [850, 340, 120, 56, 480, 210];
const RATIO_INDICATORS = ["chiffre d'affaires", 'leads qualifiés', 'trafic organique', 'ventes en ligne', 'audience', 'notoriété'];
const COUNT_INDICATORS = ['leads qualifiés', 'nouveaux abonnés', 'demandes de devis', 'inscriptions', 'visites en boutique', 'commandes'];
const DURATIONS = ['3 mois', '6 mois', '9 mois', '12 mois', '18 mois'];
const HOME_FIGURES = ['120', '15', '+42 %'];
const BUDGETS: Record<string, string> = {
  '< 5 k€': 'Moins de 5 k€',
  '5 à 15 k€': '5 à 15 k€',
  '15 à 40 k€': '15 à 40 k€',
  '> 40 k€': 'Plus de 40 k€',
};

const hash = (text: string): number => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** Small seeded generator: the same key always gives the same text. */
const random = (seed: number) => {
  let state = seed >>> 0;
  return () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
};

/** Cyclic access, so any index is valid. */
const at = <T>(list: readonly T[], index: number): T => list[((index % list.length) + list.length) % list.length];

/** `count` words of lorem ipsum in sentences of 8 to 15 words; `punctuate: false` gives a short label. */
export function lorem(count: number, key: string, punctuate = true): string {
  const next = random(hash(`lorem:${key}`));
  let cursor = Math.floor(next() * WORDS.length);
  const out: string[] = [];
  while (out.length < count) {
    const remaining = count - out.length;
    let length = 8 + Math.floor(next() * 8);
    if (remaining - length < 4) length = remaining;
    length = Math.min(length, remaining);
    const sentence: string[] = [];
    for (let i = 0; i < length; i++) sentence.push(WORDS[cursor++ % WORDS.length]);
    if (length > 9) sentence[3 + Math.floor(next() * 3)] += ',';
    sentence[0] = sentence[0][0].toUpperCase() + sentence[0].slice(1);
    if (punctuate) sentence[sentence.length - 1] += '.';
    out.push(...sentence);
  }
  return out.join(' ');
}

/** Text for the "[À FOURNIR : ..., 80 à 120 mots]" family, sized from what the placeholder asks for. */
function fromBrief(spec: string, key: string): string {
  let m = spec.match(/(\d+)\s*à\s*(\d+)\s*mots/i);
  if (m) return lorem(Math.round((Number(m[1]) + Number(m[2])) / 2), key);
  m = spec.match(/(\d+)\s*mots/i);
  if (m) return lorem(Number(m[1]), key);
  m = spec.match(/(\d+)\s*à\s*(\d+)\s*phrases/i);
  if (m) return lorem(12 * Math.round((Number(m[1]) + Number(m[2])) / 2), key);
  if (/chapeau/i.test(spec)) return lorem(22, key); // a page lead runs on two lines at the 65 character measure
  if (/2 lignes/i.test(spec)) return lorem(14, key);
  if (/^livrable/i.test(spec)) return lorem(5, key, false);
  if (/consentement/i.test(spec)) return lorem(18, key);
  return lorem(12, key);
}

/** Replacement for one placeholder (the text between the brackets), or undefined to leave it as it is. */
function fill(inner: string, key: string): string | undefined {
  const entry = Number(key.match(/(\d+)/)?.[1] ?? (hash(key) % 6) + 1);
  const result = Number(key.match(/results\.(\d+)/)?.[1] ?? 0);
  let m: RegExpMatchArray | null;
  if ((m = inner.match(/^PROJET (\d+)$/))) return at(PROJECTS, Number(m[1]) - 1);
  if ((m = inner.match(/^CLIENT (\d+)$/))) return at(CLIENTS, Number(m[1]) - 1);
  if ((m = inner.match(/^PRÉNOM NOM (\d+)$/))) return at(PEOPLE, Number(m[1]) - 1);
  if ((m = inner.match(/^CHIFFRE-(\d)$/))) return at(HOME_FIGURES, Number(m[1]) - 1);
  if ((m = inner.match(/^À FOURNIR : (.*)$/))) return fromBrief(m[1], key);
  if (inner in BUDGETS) return BUDGETS[inner];
  switch (inner) {
    case 'PRÉNOM NOM':
      return at(PEOPLE, hash(key));
    case 'FONCTION':
      return key.startsWith('equipe') ? at(TEAM_ROLES, entry - 1) : at(ROLES, hash(key));
    case 'ENTREPRISE':
      return at(CLIENTS, hash(key));
    case 'SECTEUR':
      return at(SECTORS, entry - 1);
    case 'ANNÉE':
      return at(YEARS, entry - 1);
    case 'RÔLE':
      return at(CREDIT_ROLES, hash(key));
    case 'DURÉE':
      return at(DURATIONS, entry + result);
    case 'DÉLAI':
      return '24 heures ouvrées';
    case '+XX %':
      return `+${at(PERCENTS, entry - 1 + result)} %`;
    case 'XX':
      return String(at(COUNTS, entry - 1));
    case 'INDICATEUR':
      if (key.startsWith('accueil')) return 'ventes en ligne';
      return result === 2 ? at(COUNT_INDICATORS, entry - 1) : at(RATIO_INDICATORS, entry - 1 + result);
    case 'TÉMOIGNAGE À FOURNIR':
      return lorem(26, key);
    case 'RÉSULTAT PRINCIPAL EN UNE PHRASE':
      return lorem(14, key);
    case 'DESCRIPTION 2 LIGNES':
      // A service card shows two lines of about 28 characters
      return lorem(9, key);
    default:
      return undefined;
  }
}

/**
 * Text with its placeholders replaced by demo content. `key` makes the result depend on where the text is used
 * (an entry id and a field path, or a short name), so two identical placeholders do not give the same text.
 */
export function demo(value: string, key = ''): string {
  if (!demoEnabled) return value;
  return value.replace(/\[([^\]\n]+)\]/g, (token, inner: string) => fill(inner, key) ?? token);
}

/** Same for every string of a content entry (arrays and plain objects are walked). */
export function demoData<T>(data: T, id: string, path = ''): T {
  if (!demoEnabled) return data;
  if (typeof data === 'string') return demo(data, `${id}.${path}`) as T;
  if (Array.isArray(data)) return data.map((item, index) => demoData(item, id, `${path}.${index}`)) as T;
  if (data && typeof data === 'object' && Object.getPrototypeOf(data) === Object.prototype) {
    const entries = Object.entries(data).map(([name, item]) => [name, demoData(item, id, path ? `${path}.${name}` : name)]);
    return Object.fromEntries(entries) as T;
  }
  return data;
}
