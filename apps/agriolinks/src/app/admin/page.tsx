import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import { inviteCodes } from '@/db/schema';
import { isAdminEmail } from '@/lib/admin';
import { AdminCodesForm } from './AdminCodesForm';
import '../dashboard/dashboard.css';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminEmail(session.user.email)) redirect('/dashboard');

  const codes = await getDb().select().from(inviteCodes).orderBy(desc(inviteCodes.createdAt));

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">Códigos de invitación</h1>
        </div>

        <AdminCodesForm />

        <div className="dash-card">
          <h2 className="dash-section-title">Códigos existentes</h2>
          {codes.length === 0 && <p className="dash-url">Todavía no creaste ningún código.</p>}
          {codes.map((c) => (
            <div className="dash-code-row" key={c.code}>
              <span className="dash-code-name">{c.code}</span>
              <span className="dash-code-meta">
                {c.usesCount} / {c.maxUses ?? '∞'} usos · {c.trialDays} días
                {c.note ? ` · ${c.note}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
