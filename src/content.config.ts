import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Path of a file under public/ (placeholders live in /placeholders). */
const asset = z.string().startsWith('/');

const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    year: z.string(),
    sector: z.string(),
    type: z.enum(['video', 'marketing', 'tech']),
    services: z.array(reference('services')).default([]),
    /** One sentence: the main result. Feeds the meta description. */
    summary: z.string(),
    /** 4:5 cover used on cards. */
    cover: asset,
    /** 16:9 hero of the case study. */
    hero: asset,
    video: z
      .object({ src: z.string(), poster: asset.optional(), mobileSrc: z.string().optional() })
      .optional(),
    context: z.string(),
    challenge: z.string(),
    solution: z.string(),
    solutionImages: z.array(asset).max(2).default([]),
    /** 2 to 4 key figures. */
    results: z
      .array(z.object({ value: z.string(), label: z.string(), period: z.string().optional() }))
      .min(2)
      .max(4),
    testimonial: reference('temoignages').optional(),
    gallery: z.array(z.object({ src: asset, ratio: z.enum(['16x9', '4x5']) })).default([]),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
    order: z.number().default(0),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    number: z.string(),
    title: z.string(),
    /** Card description, two lines at most. */
    short: z.string(),
    audience: z.string(),
    /** 3 to 5 deliverables. */
    deliverables: z.array(z.string()).min(3).max(5),
    image: asset,
    relatedProject: reference('projets').optional(),
    order: z.number(),
  }),
});

const equipe = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/equipe' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    portrait: asset,
    founder: z.boolean().default(false),
    bio: z.string().optional(),
    order: z.number(),
  }),
});

const temoignages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/temoignages' }),
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string(),
    company: z.string(),
    photo: asset,
    order: z.number().default(0),
  }),
});

const clients = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clients' }),
  schema: z.object({
    name: z.string(),
    logo: asset,
    order: z.number(),
  }),
});

// Blog / journal: out of scope for V1. The collection exists (empty) so it can be switched on later;
// the sitemap entry stays disabled until pages are created. To start writing articles, replace the
// empty loader with glob({ pattern: '**/*.md', base: './src/content/journal' }).
const journal = defineCollection({
  loader: async () => [],
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { projets, services, equipe, temoignages, clients, journal };
