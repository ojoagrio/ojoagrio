import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getArtistByUserId } from '@/lib/artists';
import { TiendaForm } from './TiendaForm';

export default async function TiendaDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const artist = await getArtistByUserId(session.user.id);
  if (!artist) redirect('/login');

  return <TiendaForm artist={artist} userId={session.user.id} />;
}
