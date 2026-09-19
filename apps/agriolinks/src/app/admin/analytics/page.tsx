import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminEmail } from '@/lib/admin';
import { getAdminStats } from '@/lib/admin-stats';
import { AdminNav } from '../AdminNav';
import '../../dashboard/dashboard.css';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (!isAdminEmail(session.user.email)) redirect('/dashboard');

  const s = await getAdminStats();
  const maxWeek = Math.max(1, ...s.signupsByWeek.map((w) => w.count));

  const kpis = [
    { label: 'Artistas', value: s.total },
    { label: 'Activos', value: s.active },
    { label: 'Trial vencido', value: s.trialExpired },
    { label: 'Bloqueados', value: s.blocked },
    { label: 'Visitas', value: s.totalViews },
    { label: 'Clicks en Comprar', value: s.totalClicks },
    { label: 'CTR', value: s.ctr === null ? '—' : `${s.ctr}%` },
  ];

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">Resumen</h1>
        </div>
        <AdminNav active="resumen" />

        <div className="admin-kpi-grid">
          {kpis.map((k) => (
            <div className="admin-kpi" key={k.label}>
              <span className="admin-kpi-value">{k.value}</span>
              <span className="admin-kpi-label">{k.label}</span>
            </div>
          ))}
        </div>

        <div className="dash-card">
          <h2 className="dash-section-title">Por vencer (próximos 7 días)</h2>
          {s.expiringSoon.length === 0 && <p className="dash-url">Nadie vence esta semana.</p>}
          {s.expiringSoon.map((a) => (
            <div className="admin-list-row" key={a.slug}>
              <Link className="admin-user-name" href="/admin/usuarios">
                {a.displayName} <span className="admin-user-slug">@{a.slug}</span>
              </Link>
              <span className="dash-code-meta">
                {a.daysLeft} día{a.daysLeft === 1 ? '' : 's'} · {a.viewCount} visita{a.viewCount === 1 ? '' : 's'}
              </span>
            </div>
          ))}
        </div>

        <div className="dash-card">
          <h2 className="dash-section-title">Embudo de activación</h2>
          <p className="dash-url">Cada paso cuenta solo a quienes cumplieron los anteriores.</p>
          {s.funnel.map((step) => (
            <div className="dash-code-row" key={step.label}>
              <div className="dash-code-row-main">
                <span className="admin-funnel-label">{step.label}</span>
                <span className="dash-code-meta">
                  {step.count} · {step.pctOfPrevious}%
                </span>
              </div>
              <div className="dash-code-bar">
                <div className="dash-code-bar-fill" style={{ width: `${step.pctOfPrevious}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="dash-card">
          <h2 className="dash-section-title">Registros por semana</h2>
          <div className="admin-week-bars">
            {s.signupsByWeek.map((w, i) => (
              <div className="admin-week-col" key={i}>
                <span className="admin-week-count">{w.count}</span>
                <div className="admin-week-bar" style={{ height: `${(w.count / maxWeek) * 80 + 4}px` }} />
                <span className="admin-week-label">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h2 className="dash-section-title">Top por visitas</h2>
          {s.topByViews.length === 0 && <p className="dash-url">Todavía no hay visitas.</p>}
          {s.topByViews.map((a, i) => (
            <div className="admin-list-row" key={a.slug}>
              <a className="admin-user-name" href={`/agriolinks/u/${a.slug}`} target="_blank" rel="noopener noreferrer">
                {i + 1}. {a.displayName}
              </a>
              <span className="dash-code-meta">
                {a.viewCount} visitas · {a.buyClickCount} clicks
              </span>
            </div>
          ))}
        </div>

        <div className="dash-card">
          <h2 className="dash-section-title">Sin actividad (0 visitas, +7 días registrados)</h2>
          {s.inactive.length === 0 && <p className="dash-url">Nadie en esta lista.</p>}
          {s.inactive.map((a) => (
            <div className="admin-list-row" key={a.slug}>
              <Link className="admin-user-name" href="/admin/usuarios">
                {a.displayName} <span className="admin-user-slug">@{a.slug}</span>
              </Link>
              <span className="dash-code-meta">hace {a.daysSinceSignup} días</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
