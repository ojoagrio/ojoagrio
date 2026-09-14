import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getArtistByUserId } from '@/lib/artists';
import { isAdminEmail } from '@/lib/admin';
import { ProfileForm } from './ProfileForm';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const artist = await getArtistByUserId(session.user.id);
  if (!artist) redirect('/login');

  return <ProfileForm artist={artist} userId={session.user.id} isAdmin={isAdminEmail(session.user.email)} />;
}
