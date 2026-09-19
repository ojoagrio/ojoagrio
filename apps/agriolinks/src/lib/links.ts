import type { LinkType } from '@ojoagrio/ui';
import type { ArtistLink } from './types';
import { isValidBlobUrl, isValidLinkHref } from './validators';

/** Sanity cap: keeps a public page scannable and the jsonb small. Raise here if it ever needs to grow. */
export const MAX_LINKS = 20;

export const LINK_TYPES: readonly LinkType[] = ['instagram', 'tiktok', 'spotify', 'youtube', 'custom'];

export const PLATFORM_LABELS: Record<Exclude<LinkType, 'custom'>, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

/** The four rows every new artist starts with — normal rows they can fill in, reorder or delete. */
export function defaultLinks(): ArtistLink[] {
  return (['instagram', 'tiktok', 'spotify', 'youtube'] as const).map((type) => ({
    id: crypto.randomUUID(),
    type,
    href: '',
    label: PLATFORM_LABELS[type],
    sub: '',
  }));
}

/** Rows the artist actually filled in — placeholders (empty URL) never show publicly and never count. */
export function activeLinks(links: ArtistLink[]): ArtistLink[] {
  return links.filter((l) => l.href.trim() !== '');
}

/** Button text when the artist left it blank: the platform name, or the URL's domain for custom links. */
function defaultLabel(type: LinkType, href: string): string {
  if (type !== 'custom') return PLATFORM_LABELS[type];
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return 'Link';
  }
}

export interface ParsedLinks {
  links: ArtistLink[];
  /** Keyed `link_{i}` (bad URL) or `link_{i}_icon` (bad icon), matching the form's row index. */
  fieldErrors: Record<string, string>;
}

/**
 * Reads the dashboard's single links list out of the submitted form. Pure on
 * purpose (no DB, no session) so every rule below is testable on its own.
 * Rows with an empty URL are kept (they're the "not filled in yet" state); a
 * non-empty URL must be plain http(s). Order is exactly the submitted order.
 */
export function parseLinks(formData: FormData): ParsedLinks {
  const fieldErrors: Record<string, string> = {};
  const links: ArtistLink[] = [];

  const rawCount = Number(formData.get('linkCount') ?? 0);
  const count = Number.isInteger(rawCount) && rawCount > 0 ? rawCount : 0;

  if (count > MAX_LINKS) {
    fieldErrors.links = `Podés tener hasta ${MAX_LINKS} links.`;
    return { links, fieldErrors };
  }

  for (let i = 0; i < count; i++) {
    const rawType = String(formData.get(`link_${i}_type`) ?? '');
    const type = (LINK_TYPES as readonly string[]).includes(rawType) ? (rawType as LinkType) : null;
    if (!type) continue; // unknown type: nothing sensible to render, drop the row

    const href = String(formData.get(`link_${i}_href`) ?? '').trim();
    const sub = String(formData.get(`link_${i}_sub`) ?? '').trim();
    const id = String(formData.get(`link_${i}_id`) ?? '').trim() || crypto.randomUUID();

    if (href !== '' && !isValidLinkHref(href)) {
      fieldErrors[`link_${i}`] = 'Tiene que empezar con http:// o https://.';
      continue;
    }

    const typedLabel = String(formData.get(`link_${i}_label`) ?? '').trim();
    const label = typedLabel || defaultLabel(type, href);

    const link: ArtistLink = { id, type, href, label, sub };

    // Only custom links carry an uploaded icon; a platform link always keeps its brand glyph.
    const icon = String(formData.get(`link_${i}_icon`) ?? '').trim();
    if (type === 'custom' && icon) {
      if (isValidBlobUrl(icon)) link.iconUrl = icon;
      else fieldErrors[`link_${i}_icon`] = 'Ícono inválido.';
    }

    links.push(link);
  }

  return { links, fieldErrors };
}
