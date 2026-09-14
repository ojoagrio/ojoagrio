import { notFound } from 'next/navigation';
import { SocialButton } from '@ojoagrio/ui';
import { getMockArtistBySlug } from '@/lib/mock-artists';
import { RevealOnMount } from '@/components/RevealOnMount';

interface Props {
  params: Promise<{ usuario: string }>;
}

export default async function ArtistPage({ params }: Props) {
  const { usuario } = await params;
  const artist = getMockArtistBySlug(usuario);

  if (!artist) notFound();

  return (
    <RevealOnMount>
      <main className="wrap">
        <h1 className="title display reveal">{artist.displayName}</h1>
        <p className="bio reveal">{artist.bio}</p>
        <div className="links">
          {artist.links.map((link) => (
            <SocialButton key={link.href} {...link} />
          ))}
        </div>
        <footer className="reveal">Hecho con AgrioLinks</footer>
      </main>
    </RevealOnMount>
  );
}
