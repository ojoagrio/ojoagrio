import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getArtistByUserId } from '@/lib/artists';
import { ProfileForm } from './ProfileForm';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/agriolinks/login');

  const artist = await getArtistByUserId(session.user.id);
  if (!artist) redirect('/agriolinks/login');

  return (
    <main className="wrap">
      <h1 className="title display">Tu página</h1>
      <p className="bio">Editá tu bio, tus links y tu fondo animado. Los cambios se ven al toque en tu página pública.</p>
      <ProfileForm artist={artist} />
    </main>
  );
}
