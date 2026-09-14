import { SocialButton } from '@ojoagrio/ui';
import type { ArtistProfile } from '@/lib/types';

interface Props {
  artist: Pick<ArtistProfile, 'displayName' | 'bio' | 'links'>;
  /** Scroll-in `.reveal` animation only makes sense once, on the real public page. */
  reveal?: boolean;
}

/** The actual public artist page content — shared by /u/[usuario] and the dashboard's inline preview. */
export function ArtistPublicView({ artist, reveal = true }: Props) {
  const revealClass = reveal ? ' reveal' : '';
  return (
    <main className="wrap">
      <h1 className={`title display${revealClass}`}>{artist.displayName}</h1>
      <p className={`bio${revealClass}`}>{artist.bio}</p>
      <div className="links">
        {artist.links.map((link) => (
          <SocialButton key={link.href} {...link} reveal={reveal} />
        ))}
      </div>
      <footer className={revealClass.trim()}>Hecho con AgrioLinks</footer>
    </main>
  );
}
