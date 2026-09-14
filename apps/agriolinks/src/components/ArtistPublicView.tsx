import { SocialButton } from '@ojoagrio/ui';
import type { ArtistProfile } from '@/lib/types';

interface Props {
  artist: Pick<ArtistProfile, 'displayName' | 'bio' | 'links' | 'avatarUrl'>;
  /** Scroll-in `.reveal` animation only makes sense once, on the real public page. */
  reveal?: boolean;
}

/** The actual public artist page content — shared by /u/[usuario] and the dashboard's inline preview. */
export function ArtistPublicView({ artist, reveal = true }: Props) {
  const revealClass = reveal ? ' reveal' : '';
  return (
    <main className="wrap">
      <div className={`avatar${revealClass}`}>
        {artist.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
          <img src={artist.avatarUrl} alt={artist.displayName} />
        ) : (
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" fill="#FFB347" stroke="#241A2E" strokeWidth={5} />
            <ellipse cx="50" cy="52" rx="30" ry="20" fill="#fff" stroke="#241A2E" strokeWidth={4} />
            <circle cx="38" cy="48" r="5" fill="#241A2E" />
            <circle cx="62" cy="48" r="5" fill="#241A2E" />
            <path d="M35 62 Q50 72 65 62" stroke="#241A2E" strokeWidth={4} fill="none" strokeLinecap="round" />
          </svg>
        )}
      </div>
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
