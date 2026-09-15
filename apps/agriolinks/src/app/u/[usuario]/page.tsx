import { notFound } from 'next/navigation';
import { getArtistBySlug, isSuspended, incrementViewCount } from '@/lib/artists';
import { RevealOnMount } from '@/components/RevealOnMount';
import { ArtistPublicView } from '@/components/ArtistPublicView';

interface Props {
  params: Promise<{ usuario: string }>;
}

export default async function ArtistPage({ params }: Props) {
  const { usuario } = await params;
  const artist = await getArtistBySlug(usuario);

  if (!artist) notFound();
  await incrementViewCount(usuario);

  const paused = isSuspended(artist);
  // Same reasoning as the tienda page: don't ship bio/links to the client at
  // all once paused, or they'd still ride along in React's hydration
  // payload even though nothing renders them.
  return (
    <RevealOnMount>
      <ArtistPublicView artist={paused ? { ...artist, bio: '', links: [], products: [] } : artist} paused={paused} />
    </RevealOnMount>
  );
}
