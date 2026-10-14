import { site } from '../config/site';
import { realValue } from './placeholders';

type JsonLd = Record<string, unknown>;

/** ProfessionalService: only real values are emitted, never bracketed placeholders. */
export function professionalService(origin: string): JsonLd {
  const sameAs = [site.social.instagram, site.social.linkedin].filter((url) => /^https?:\/\//i.test(url));
  const city = realValue(site.city);
  const street = realValue(site.address);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    url: origin,
    description: site.tagline,
    image: `${origin}/og/accueil.png`,
    ...(realValue(site.email) && { email: site.email }),
    ...(realValue(site.phone) && { telephone: site.phone }),
    ...((city || street) && {
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'FR',
        ...(city && { addressLocality: city }),
        ...(street && { streetAddress: street }),
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function breadcrumb(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPage(faqs: readonly { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function creativeWork(input: { name: string; description: string; url: string; image: string; client: string; year: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: input.url,
    image: input.image,
    creator: { '@type': 'Organization', name: site.name },
    ...(realValue(input.client) && { about: { '@type': 'Organization', name: input.client } }),
    ...(realValue(input.year) && { dateCreated: input.year }),
  };
}
