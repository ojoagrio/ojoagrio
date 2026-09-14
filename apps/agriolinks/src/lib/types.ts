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
  links: ArtistLink[];
}
