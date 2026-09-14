import type { SocialType } from '@ojoagrio/ui';

export interface ArtistLink {
  type: SocialType;
  href: string;
  label: string;
  sub: string;
}

export interface ArtistProfile {
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  links: ArtistLink[];
  /** Null means no trial is tracked for this artist (e.g. the seeded demo). */
  trialEndsAt: Date | null;
}
