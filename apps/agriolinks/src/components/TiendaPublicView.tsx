import Link from 'next/link';
import type { ArtistProfile } from '@/lib/types';
import '@/styles/tienda.css';

interface Props {
  artist: Pick<ArtistProfile, 'displayName' | 'slug' | 'products' | 'whatsappNumber'>;
  /** True once the artist's trial/plan has expired — shows a paused message instead of products. */
  paused?: boolean;
}

function whatsappHref(number: string, productName: string, price: number): string {
  const text = encodeURIComponent(`Hola! Me interesa "${productName}" ($${price} MXN) de tu tienda de AgrioLinks.`);
  return `https://wa.me/${number}?text=${text}`;
}

/** Minimalist product-catalog page — deliberately distinct from AgrioLinks' comic-book link page. */
export function TiendaPublicView({ artist, paused = false }: Props) {
  return (
    <main className="tienda-wrap">
      <header className="tienda-header">
        <Link className="tienda-back" href={`/u/${artist.slug}`}>
          ← {artist.displayName}
        </Link>
        <h1 className="tienda-title">Tienda</h1>
      </header>

      {paused ? (
        <p className="tienda-paused">⏸️ Esta tienda está pausada. Volvé pronto.</p>
      ) : artist.products.length === 0 ? (
        <p className="tienda-paused">Todavía no hay productos cargados.</p>
      ) : (
        <div className="tienda-grid">
          {artist.products.map((product) => (
            <div className="tienda-card" key={product.id}>
              <div className="tienda-photo">
                {product.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
                  <img src={product.photos[0]} alt={product.name} />
                ) : (
                  <span className="tienda-photo-placeholder">🖼️</span>
                )}
              </div>
              <h2 className="tienda-name">{product.name}</h2>
              <p className="tienda-price">${product.price} MXN</p>
              <p className="tienda-availability">
                {product.available > 0 ? `${product.available} pieza${product.available === 1 ? '' : 's'} disponible${product.available === 1 ? '' : 's'}` : 'Agotado'}
              </p>
              {product.description && <p className="tienda-description">{product.description}</p>}
              {artist.whatsappNumber && product.available > 0 && (
                <a
                  className="tienda-buy"
                  href={whatsappHref(artist.whatsappNumber, product.name, product.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Comprar por WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
