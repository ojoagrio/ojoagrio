import Link from 'next/link';

const TABS = [
  { key: 'resumen', label: 'Resumen', href: '/admin/analytics' },
  { key: 'codigos', label: 'Códigos', href: '/admin' },
  { key: 'usuarios', label: 'Usuarios', href: '/admin/usuarios' },
] as const;

export function AdminNav({ active }: { active: (typeof TABS)[number]['key'] }) {
  return (
    <div className="dash-admin-nav">
      {TABS.map((tab) =>
        tab.key === active ? (
          <span key={tab.key} className="dash-admin-nav-item active">
            {tab.label}
          </span>
        ) : (
          <Link key={tab.key} className="dash-admin-nav-item" href={tab.href}>
            {tab.label}
          </Link>
        )
      )}
    </div>
  );
}
