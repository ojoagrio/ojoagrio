import { notFound } from 'next/navigation';
import { getArtistBySlug, isTrialExpired, incrementViewCount } from '@/lib/artists';
import { TiendaPublicView } from '@/components/TiendaPublicView';

interface Props {
  params: Promise<{ usuario: string }>;
}

export default async function TiendaPage({ params }: Props) {
  const { usuario } = await params;
  const artist = await getArtistBySlug(usuario);

  if (!artist) notFound();
  await incrementViewCount(usuario);

  return <TiendaPublicView artist={artist} paused={isTrialExpired(artist.trialEndsAt)} />;
}
