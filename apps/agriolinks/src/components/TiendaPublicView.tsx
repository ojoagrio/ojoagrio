import Link from 'next/link';
import type { ArtistProfile } from '@/lib/types';
import { ProductPhotoCarousel } from './ProductPhotoCarousel';
import { BuyButton } from './BuyButton';
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

/** JSON-LD so search engines and AI answer-assistants can index each product directly. */
function productJsonLd(artist: Props['artist']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: artist.products.map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description || undefined,
        image: product.photos,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: product.price,
          availability:
            product.available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };
}

/** Minimalist product-catalog page — deliberately distinct from AgrioLinks' comic-book link page. */
export function TiendaPublicView({ artist, paused = false }: Props) {
  const showProducts = !paused && artist.products.length > 0;

  return (
    <main className="tienda-wrap">
      {showProducts && (
        // eslint-disable-next-line react/no-danger -- static JSON-LD we build ourselves, no user HTML
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(artist)) }}
        />
      )}
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
              <ProductPhotoCarousel photos={product.photos} alt={product.name} />
              <h2 className="tienda-name">{product.name}</h2>
              <p className="tienda-price">${product.price} MXN</p>
              <p className="tienda-availability">
                {product.available > 0 ? `${product.available} pieza${product.available === 1 ? '' : 's'} disponible${product.available === 1 ? '' : 's'}` : 'Agotado'}
              </p>
              {product.description && <p className="tienda-description">{product.description}</p>}
              {artist.whatsappNumber && product.available > 0 && (
                <BuyButton href={whatsappHref(artist.whatsappNumber, product.name, product.price)} slug={artist.slug} />
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
