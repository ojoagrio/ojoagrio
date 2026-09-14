import type { SocialType } from '@ojoagrio/ui';

export interface ArtistLink {
  type: SocialType;
  href: string;
  label: string;
  sub: string;
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
}
