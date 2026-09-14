import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="wrap">
      <h1 className="title display">AGRIOLINKS</h1>
      <span className="subtitle">🔗 Tu página de links, con fondos animados</span>
      <p className="bio">
        Una sola página con todos tus links, música y redes — con fondos animados que la hacen
        destacar. Hecha para artistas independientes.
      </p>
      <div className="links">
        <Link className="link-btn" href="/agriolinks/signup">
          <span className="link-label">Crear mi página</span>
        </Link>
        <Link className="link-btn" href="/agriolinks/login">
          <span className="link-label">Ya tengo cuenta</span>
        </Link>
      </div>
      <footer>© {new Date().getFullYear()} AgrioLinks — un producto de OjoAgrio</footer>
    </main>
  );
}
