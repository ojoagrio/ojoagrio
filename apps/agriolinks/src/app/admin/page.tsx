import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import { inviteCodes } from '@/db/schema';
import { isAdminEmail } from '@/lib/admin';
import { AdminCodesForm } from './AdminCodesForm';
import { AdminNav } from './AdminNav';
import '../dashboard/dashboard.css';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminEmail(session.user.email)) redirect('/dashboard');

  // Most-used first — with several codes segmented by channel (AGRIOFREE_IG,
  // AGRIOFREE_TIKTOK, ...), this is what tells you which channel is actually
  // converting at a glance, without a separate analytics tool.
  const codes = await getDb().select().from(inviteCodes).orderBy(desc(inviteCodes.usesCount), desc(inviteCodes.createdAt));
  const maxUses = Math.max(1, ...codes.map((c) => c.usesCount));

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">Códigos de invitación</h1>
        </div>
        <AdminNav active="codigos" />

        <AdminCodesForm />

        <div className="dash-card">
          <h2 className="dash-section-title">Códigos existentes</h2>
          {codes.length === 0 && <p className="dash-url">Todavía no creaste ningún código.</p>}
          {codes.map((c, i) => (
            <div className="dash-code-row" key={c.code}>
              <div className="dash-code-row-main">
                <span className="dash-code-name">
                  {i === 0 && c.usesCount > 0 ? '🏆 ' : ''}
                  {c.code}
                </span>
                <span className="dash-code-meta">
                  {c.usesCount} / {c.maxUses ?? '∞'} usos · {c.trialDays} días · {c.maxProducts} productos
                  {c.note ? ` · ${c.note}` : ''}
                </span>
              </div>
              <div className="dash-code-bar">
                <div className="dash-code-bar-fill" style={{ width: `${(c.usesCount / maxUses) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
