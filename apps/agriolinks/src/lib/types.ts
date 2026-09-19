import type { LinkType } from '@ojoagrio/ui';

export interface ArtistLink {
  /** Stable identity for reordering/keys; optional so a row missing one still renders. */
  id?: string;
  type: LinkType;
  /** Empty string = placeholder row the artist hasn't filled in yet (never shown publicly). */
  href: string;
  label: string;
  sub: string;
  /** Uploaded icon (Vercel Blob URL) — only meaningful for type 'custom'. */
  iconUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  available: number;
  description: string;
  photos: string[];
}

export interface ArtistProfile {
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  links: ArtistLink[];
  products: Product[];
  whatsappNumber: string | null;
  maxProducts: number;
  /** Null means no trial is tracked for this artist (e.g. the seeded demo). */
  trialEndsAt: Date | null;
  isBlocked: boolean;
}
