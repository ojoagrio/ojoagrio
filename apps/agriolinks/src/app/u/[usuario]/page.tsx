import { notFound } from 'next/navigation';
import { getArtistBySlug, isTrialExpired } from '@/lib/artists';
import { RevealOnMount } from '@/components/RevealOnMount';
import { ArtistPublicView } from '@/components/ArtistPublicView';

interface Props {
  params: Promise<{ usuario: string }>;
}

export default async function ArtistPage({ params }: Props) {
  const { usuario } = await params;
  const artist = await getArtistBySlug(usuario);

  if (!artist) notFound();

  return (
    <RevealOnMount>
      <ArtistPublicView artist={artist} paused={isTrialExpired(artist.trialEndsAt)} />
    </RevealOnMount>
  );
}
