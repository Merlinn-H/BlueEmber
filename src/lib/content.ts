import { getCollection, getEntries, getEntry } from 'astro:content';
import type { CollectionKey } from 'astro:content';
import { demoData } from './demo';

// Content collections with the demo content applied (see lib/demo.ts): same calls as astro:content, same shapes.
// Pages and components read content through these instead of astro:content, so placeholders show as demo text.
type Entry = { id: string; data: unknown };

const apply = <T extends Entry>(entry: T): T => ({ ...entry, data: demoData(entry.data, entry.id) });

export const getContent = (async (name: Parameters<typeof getCollection>[0]) =>
  ((await getCollection(name)) as Entry[]).map(apply)) as unknown as typeof getCollection;

export const getContentEntry = (async (reference: { collection: CollectionKey; id: string }) => {
  const entry = (await getEntry(reference as never)) as Entry | undefined;
  return entry ? apply(entry) : entry;
}) as unknown as typeof getEntry;

export const getContentEntries = (async (references: Parameters<typeof getEntries>[0]) =>
  ((await getEntries(references)) as Entry[]).map(apply)) as unknown as typeof getEntries;
