/** True when the text still contains a bracketed placeholder such as [VILLE]. */
export const isPlaceholder = (value: string | undefined | null): boolean =>
  typeof value === 'string' && /\[[^\]]+\]/.test(value);

/** Value suitable for structured data (JSON-LD): undefined while it is still a placeholder. */
export const realValue = (value: string | undefined | null): string | undefined =>
  value && !isPlaceholder(value) ? value : undefined;

export const mailto = (email: string) => `mailto:${email}`;

export const tel = (phone: string) => `tel:${phone.replace(/[^+\d[\]A-Z]/gi, '')}`;

/** Social links stay inert (#) until a real URL replaces the placeholder. */
export const externalHref = (value: string) => (/^https?:\/\//i.test(value) ? value : '#');

/** Splits a number-like value so the counter animation can run; null for placeholders. */
export const countable = (value: string): number | null => {
  if (isPlaceholder(value)) return null;
  const match = value.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : null;
};
