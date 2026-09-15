import { notFound } from 'next/navigation';
import { getArtistBySlug, isSuspended, incrementViewCount } from '@/lib/artists';
import { TiendaPublicView } from '@/components/TiendaPublicView';

interface Props {
  params: Promise<{ usuario: string }>;
}

export default async function TiendaPage({ params }: Props) {
  const { usuario } = await params;
  const artist = await getArtistBySlug(usuario);

  if (!artist) notFound();
  await incrementViewCount(usuario);

  const paused = isSuspended(artist);
  // Don't hand the catalog to the client at all once paused — the visible
  // markup already hides it, but React's hydration payload otherwise still
  // ships the full product list (names, prices) inside a <script> tag,
  // readable via "view source" even though nothing renders.
  return <TiendaPublicView artist={paused ? { ...artist, products: [] } : artist} paused={paused} />;
}
