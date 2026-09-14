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

// TODO(ticket 003 del mapa de wayfinder): reemplazar por una lectura real a
// la DB (tabla `artists`) una vez esté provisionada. Este mock solo existe
// para validar el diseño portado a React antes de conectar datos reales.
const MOCK_ARTISTS: Record<string, ArtistProfile> = {
  demo: {
    slug: 'demo',
    displayName: 'Artista Demo',
    bio: 'Esta es una página de ejemplo de AgrioLinks — así se va a ver la tuya.',
    links: [
      { type: 'instagram', href: 'https://instagram.com', label: 'Instagram', sub: '@artista.demo' },
      { type: 'spotify', href: 'https://open.spotify.com', label: 'Spotify', sub: 'Escuchá mi música' },
    ],
  },
};

export function getMockArtistBySlug(slug: string): ArtistProfile | null {
  return MOCK_ARTISTS[slug] ?? null;
}
