'use client';

import { useActionState, useState } from 'react';
import { isTrialExpired, type OwnArtistProfile } from '@/lib/artists';
import type { Product } from '@/lib/types';
import { ShareButton } from '../ShareButton';
import { ComingSoonModal } from '../ComingSoonModal';
import { ProductPhotosUpload } from './ProductPhotosUpload';
import { saveTienda, type SaveTiendaState } from './actions';
import '../dashboard.css';

const initialState: SaveTiendaState = {};

function emptyProduct(): Product {
  return { id: crypto.randomUUID(), name: '', price: 0, available: 0, description: '', photos: [] };
}

export function TiendaForm({ artist, userId }: { artist: OwnArtistProfile; userId: string }) {
  const [state, formAction, pending] = useActionState(saveTienda, initialState);
  const [products, setProducts] = useState<Product[]>(artist.products);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const expired = isTrialExpired(artist.trialEndsAt);
  const publicPath = `/agriolinks/u/${artist.slug}/tienda`;
  const atLimit = products.length >= artist.maxProducts;

  function addProduct() {
    if (atLimit) return;
    setProducts([...products, emptyProduct()]);
  }

  function removeProduct(id: string) {
    setProducts(products.filter((p) => p.id !== id));
  }

  function updatePhotos(id: string, photos: string[]) {
    setProducts(products.map((p) => (p.id === id ? { ...p, photos } : p)));
  }

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">Tu tienda</h1>
          <div className="dash-topbar-actions">
            <ShareButton path={publicPath} title={`Tienda de ${artist.displayName}`} />
          </div>
        </div>
        <p className="dash-url">
          ojoagrio.com<strong>{publicPath}</strong>
        </p>

        {expired && (
          <div className="dash-trial-banner expired">
            <span>⏸️ Tu mes gratis terminó — tu tienda quedó pausada hasta que renueves.</span>
            <button
              type="button"
              className="dash-btn-primary"
              style={{ flex: '0 0 auto' }}
              onClick={() => setShowComingSoon(true)}
            >
              Comprar plan
            </button>
          </div>
        )}

        <form action={formAction}>
          <input type="hidden" name="productCount" value={products.length} readOnly />

          <fieldset disabled={expired} className={`dash-card${expired ? ' dash-card-disabled' : ''}`}>
            <h2 className="dash-section-title">Contacto</h2>
            <div className="dash-field">
              <label className="dash-label" htmlFor="whatsappNumber">
                Número de WhatsApp (con código de país, solo dígitos)
              </label>
              <input
                id="whatsappNumber"
                className="dash-input"
                name="whatsappNumber"
                defaultValue={artist.whatsappNumber ?? ''}
                placeholder="521XXXXXXXXXX"
              />
            </div>
          </fieldset>

          {products.map((product, index) => (
            <fieldset disabled={expired} className={`dash-card${expired ? ' dash-card-disabled' : ''}`} key={product.id}>
              <h2 className="dash-section-title">Producto {index + 1}</h2>
              <input type="hidden" name={`product_${index}_id`} value={product.id} readOnly />
              <input type="hidden" name={`product_${index}_photos`} value={JSON.stringify(product.photos)} readOnly />

              <div className="dash-field">
                <label className="dash-label">Fotos (hasta 3)</label>
                <ProductPhotosUpload
                  userId={userId}
                  productId={product.id}
                  initialUrls={product.photos}
                  onChange={(photos) => updatePhotos(product.id, photos)}
                />
              </div>

              <div className="dash-field">
                <label className="dash-label" htmlFor={`product_${index}_name`}>
                  Nombre
                </label>
                <input
                  id={`product_${index}_name`}
                  className="dash-input"
                  name={`product_${index}_name`}
                  defaultValue={product.name}
                  placeholder="Ej: Astro Bunny"
                  required
                />
              </div>

              <div className="dash-field">
                <label className="dash-label" htmlFor={`product_${index}_price`}>
                  Precio (MXN)
                </label>
                <input
                  id={`product_${index}_price`}
                  className="dash-input"
                  name={`product_${index}_price`}
                  type="number"
                  min={0}
                  defaultValue={product.price || ''}
                  required
                />
              </div>

              <div className="dash-field">
                <label className="dash-label" htmlFor={`product_${index}_available`}>
                  Piezas disponibles
                </label>
                <input
                  id={`product_${index}_available`}
                  className="dash-input"
                  name={`product_${index}_available`}
                  type="number"
                  min={0}
                  defaultValue={product.available || ''}
                  required
                />
              </div>

              <div className="dash-field">
                <label className="dash-label" htmlFor={`product_${index}_description`}>
                  Descripción corta
                </label>
                <textarea
                  id={`product_${index}_description`}
                  className="dash-textarea"
                  name={`product_${index}_description`}
                  defaultValue={product.description}
                  rows={2}
                  placeholder="Contá algo breve de la pieza"
                />
              </div>

              <div className="dash-actions">
                <button type="button" className="dash-btn-secondary" onClick={() => removeProduct(product.id)}>
                  Quitar producto
                </button>
              </div>
            </fieldset>
          ))}

          {!expired && (
            <button type="button" className="dash-btn-secondary" onClick={addProduct} disabled={atLimit} style={{ width: '100%', marginBottom: 18 }}>
              + Agregar producto ({products.length}/{artist.maxProducts})
            </button>
          )}

          {state.error && <p className="dash-message error">{state.error}</p>}
          {state.saved && <p className="dash-message success">Guardado ✅</p>}

          <div className="dash-actions">
            {expired ? (
              <button className="dash-btn-primary" type="button" onClick={() => setShowComingSoon(true)}>
                Comprar plan
              </button>
            ) : (
              <button className="dash-btn-primary" type="submit" disabled={pending}>
                {pending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </form>
      </div>
      <ComingSoonModal open={showComingSoon} onClose={() => setShowComingSoon(false)} />
    </div>
  );
}
