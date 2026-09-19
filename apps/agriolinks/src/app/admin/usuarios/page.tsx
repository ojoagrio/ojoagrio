import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import { isAdminEmail } from '@/lib/admin';
import { isSuspended, isTrialExpired } from '@/lib/artists';
import { AdminNav } from '../AdminNav';
import { toggleBlocked, redeemCodeForArtist } from './actions';
import '../../dashboard/dashboard.css';

interface Props {
  searchParams: Promise<{ error?: string; ok?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminEmail(session.user.email)) redirect('/dashboard');

  const { error, ok } = await searchParams;
  const allArtists = await getDb().select().from(artists).orderBy(desc(artists.createdAt));

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">Usuarios</h1>
        </div>
        <AdminNav active="usuarios" />

        {error && <p className="dash-message error">{error}</p>}
        {ok && <p className="dash-message success">Cupón aplicado ✅</p>}

        {allArtists.map((artist) => {
          const suspended = isSuspended(artist);
          const trialExpired = isTrialExpired(artist.trialEndsAt);
          const publicPath = `/agriolinks/u/${artist.slug}`;
          return (
            <div className="dash-card admin-user-card" key={artist.slug}>
              <div className="admin-user-main">
                <div>
                  <a className="admin-user-name" href={publicPath} target="_blank" rel="noopener noreferrer">
                    👁️ {artist.displayName} <span className="admin-user-slug">@{artist.slug}</span>
                  </a>
                  <p className="dash-stats-row" style={{ margin: '4px 0 0' }}>
                    👁️ {artist.viewCount} visitas · 💬 {artist.buyClickCount} clicks · 🔗 {(artist.links as unknown[]).length} links ·
                    🛍️ {(artist.products as unknown[]).length}/{artist.maxProducts} productos
                  </p>
                </div>
                <span className={`dash-badge ${artist.isBlocked ? 'soldout' : suspended ? 'soldout' : 'available'}`}>
                  {artist.isBlocked ? 'Bloqueado' : trialExpired ? 'Trial vencido' : 'Activo'}
                </span>
              </div>

              <div className="admin-user-actions">
                <form action={toggleBlocked}>
                  <input type="hidden" name="slug" value={artist.slug} />
                  <input type="hidden" name="blocked" value={String(!artist.isBlocked)} />
                  <button type="submit" className="dash-btn-secondary">
                    {artist.isBlocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </form>

                <form action={redeemCodeForArtist} className="admin-user-redeem-form">
                  <input type="hidden" name="slug" value={artist.slug} />
                  <input className="dash-input" name="code" placeholder="Código de cupón" />
                  <button type="submit" className="dash-btn-secondary">
                    Canjear
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
