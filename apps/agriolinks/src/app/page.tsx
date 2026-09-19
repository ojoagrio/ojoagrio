import Link from 'next/link';
import { isNotNull, count } from 'drizzle-orm';
import { getDb } from '@/db';
import { artists } from '@/db/schema';
import './landing.css';

// Without this, Next prerenders the landing once at build time and the real
// artist count below would freeze at whatever it was then. Revalidate
// hourly — plenty fresh for a slow-moving counter, still cheap to serve.
export const revalidate = 3600;

const FREE_MONTH_CODE = 'AGRIOFREE';
const SIGNUP_WITH_CODE = `/signup?code=${FREE_MONTH_CODE}`;

const FEATURES = [
  {
    icon: '🎨',
    title: 'Fondos animados',
    text: 'Elegí entre 6 efectos en movimiento — líquido, bruma, red, halo y más. Ningún Linktree genérico tiene esto.',
  },
  {
    icon: '🔗',
    title: 'Todo en un link',
    text: 'Instagram, TikTok, Spotify, YouTube y lo que sumes, todo junto, listo para pegar en tu bio.',
  },
  {
    icon: '📱',
    title: 'Tu propio dashboard',
    text: 'Editá tu bio, tus links y tu fondo cuando quieras, sin tocar código ni depender de nadie.',
  },
  {
    icon: '🖼️',
    title: 'Foto de perfil',
    text: 'Subí tu foto y que tu página se vea profesional desde el primer segundo.',
  },
  {
    icon: '⚡',
    title: 'Armala en minutos',
    text: 'Cargás tus links, elegís tu fondo, guardás. Sin curva de aprendizaje ni manual.',
  },
  {
    icon: '🇲🇽',
    title: 'Hecho para artistas independientes',
    text: 'Pensado para el ritmo real de un artista urbano, no para una empresa de tecnología.',
  },
];

const STEPS = [
  {
    title: 'Activá tu acceso',
    text: 'Tocá el botón de abajo y arrancá tu mes gratis — sin tarjeta, sin vueltas.',
  },
  {
    title: 'Armá tu página',
    text: 'Subí tu foto, escribí tu bio, cargá tus links y elegí tu fondo animado favorito.',
  },
  {
    title: 'Compartí tu link',
    text: 'Poné tu link de AgrioLinks en tu bio de Instagram o TikTok y listo.',
  },
];

const FAQS = [
  {
    q: '¿Necesito saber de tecnología?',
    a: 'Para nada. Todo se edita desde un panel simple — como llenar un formulario. Si sabés usar Instagram, sabés usar AgrioLinks.',
  },
  {
    q: '¿Qué pasa cuando termina mi mes gratis?',
    a: 'Tu cuenta y tus datos quedan guardados. Tu página pública pasa a un modo pausado hasta que actives tu plan — no perdés nada.',
  },
  {
    q: '¿Puedo cambiar mi fondo animado después?',
    a: 'Sí, cuando quieras, desde tu dashboard. Podés probar los 6 efectos las veces que quieras.',
  },
  {
    q: '¿Cómo pago después del mes gratis?',
    a: 'Por ahora coordinamos el pago directo con cada artista mientras terminamos de armar el cobro automático. Vas a ver un aviso en tu dashboard cuando llegue el momento.',
  },
];

/** Real signup count (excludes the hand-seeded demo artist, which has no tracked trial) — never fabricated, so it's simply not shown until it's worth showing. */
async function getRealArtistCount(): Promise<number> {
  try {
    const [row] = await getDb().select({ n: count() }).from(artists).where(isNotNull(artists.trialEndsAt));
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

export default async function LandingPage() {
  const artistCount = await getRealArtistCount();

  return (
    <div className="landing">
      <section className="landing-hero">
        <span className="landing-eyebrow">🔗 AGRIOLINKS</span>
        <h1 className="landing-h1">Tu página de links, con fondos que se mueven</h1>
        <p className="landing-subhead">
          Todo tu Instagram, TikTok, Spotify y YouTube en un solo link — con fondos animados que
          ningún Linktree tiene. Hecho para raperos, productores y artistas independientes.
        </p>
        {artistCount > 0 && (
          <p className="landing-social-proof">
            🎉 Ya se sumaron {artistCount} artista{artistCount === 1 ? '' : 's'} independiente{artistCount === 1 ? '' : 's'}
          </p>
        )}
        <div className="landing-cta-row">
          <Link className="landing-btn-primary" href={SIGNUP_WITH_CODE}>
            🎁 Quiero mi mes gratis
          </Link>
          <Link className="landing-btn-secondary" href="/u/demo">
            👁️ Ver un ejemplo real
          </Link>
        </div>
        <p className="landing-fineprint">Sin tarjeta de crédito. Cupos limitados mientras estamos en beta.</p>
      </section>

      <section className="landing-section">
        <span className="landing-kicker">¿QUÉ TE LLEVÁS?</span>
        <h2 className="landing-h2">Todo lo que necesitás para tu link-in-bio</h2>
        <div className="landing-grid">
          {FEATURES.map((f) => (
            <div className="landing-card" key={f.title}>
              <span className="landing-card-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <span className="landing-kicker">CÓMO FUNCIONA</span>
        <h2 className="landing-h2">De cero a tu página online en 5 minutos</h2>
        <div className="landing-steps">
          {STEPS.map((s, i) => (
            <div className="landing-step" key={s.title}>
              <div className="landing-step-number">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-narrow">
        <span className="landing-kicker">MIRALO EN VIVO</span>
        <h2 className="landing-h2">Así se ve una página de AgrioLinks</h2>
        <div className="landing-demo">
          <div className="landing-phone">
            <iframe src="/agriolinks/u/demo" title="Ejemplo de página AgrioLinks" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-narrow" id="precio">
        <span className="landing-kicker">PRECIO</span>
        <h2 className="landing-h2">Un plan, sin letra chica</h2>
        <div className="landing-price-card">
          <span className="landing-price-badge">🎁 Primer mes gratis</span>
          <p className="landing-price">
            $250 <span>MXN / mes</span>
          </p>
          <p className="landing-price-note">Después de tu mes gratis. Cancelás cuando quieras.</p>
          <ul className="landing-price-list">
            <li>✅ Página pública con tu propio link</li>
            <li>✅ 6 fondos animados para elegir</li>
            <li>✅ Foto de perfil y hasta 20 links</li>
            <li>✅ Dashboard para editar todo vos mismo</li>
          </ul>
          <Link className="landing-btn-primary" href={SIGNUP_WITH_CODE} style={{ width: '100%', justifyContent: 'center' }}>
            🎁 Activar mi mes gratis
          </Link>
        </div>
      </section>

      <section className="landing-section landing-section-narrow">
        <span className="landing-kicker">PREGUNTAS FRECUENTES</span>
        <h2 className="landing-h2">Lo que seguro querés saber</h2>
        <div className="landing-faq">
          {FAQS.map((f) => (
            <details className="landing-faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-narrow">
        <div className="landing-final-cta">
          <h2 className="landing-h2">¿Listo para tener tu página?</h2>
          <div className="landing-cta-row">
            <Link className="landing-btn-primary" href={SIGNUP_WITH_CODE}>
              🎁 Quiero mi mes gratis
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} AgrioLinks — un producto de{' '}
        <a href="https://ojoagrio.com" target="_blank" rel="noopener noreferrer">
          OjoAgrio
        </a>
      </footer>
    </div>
  );
}
