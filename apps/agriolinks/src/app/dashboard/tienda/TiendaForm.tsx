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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const expired = isTrialExpired(artist.trialEndsAt);
  const publicPath = `/agriolinks/u/${artist.slug}/tienda`;
  const atLimit = products.length >= artist.maxProducts;

  function addProduct() {
    if (atLimit) return;
    const product = emptyProduct();
    setProducts([...products, product]);
    setEditingId(product.id);
  }

  function removeProduct(id: string) {
    setProducts(products.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function updateField<K extends keyof Product>(id: string, field: K, value: Product[K]) {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
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

          {products.map((product, index) => {
            const isEditing = editingId === product.id;
            return (
              <fieldset
                disabled={expired}
                className={`dash-card dash-product-card${expired ? ' dash-card-disabled' : ''}${isEditing ? ' dash-product-card-editing' : ''}`}
                key={product.id}
              >
                <input type="hidden" name={`product_${index}_id`} value={product.id} readOnly />
                <input type="hidden" name={`product_${index}_name`} value={product.name} readOnly />
                <input type="hidden" name={`product_${index}_price`} value={product.price} readOnly />
                <input type="hidden" name={`product_${index}_available`} value={product.available} readOnly />
                <input type="hidden" name={`product_${index}_description`} value={product.description} readOnly />
                <input type="hidden" name={`product_${index}_photos`} value={JSON.stringify(product.photos)} readOnly />

                {isEditing ? (
                  <>
                    <h2 className="dash-section-title">{product.name || `Producto ${index + 1}`}</h2>

                    <div className="dash-field">
                      <label className="dash-label">Fotos (hasta 3)</label>
                      <ProductPhotosUpload
                        key={product.id}
                        userId={userId}
                        productId={product.id}
                        initialUrls={product.photos}
                        onChange={(photos) => updateField(product.id, 'photos', photos)}
                      />
                    </div>

                    <div className="dash-field">
                      <label className="dash-label">Nombre</label>
                      <input
                        className="dash-input"
                        value={product.name}
                        onChange={(e) => updateField(product.id, 'name', e.target.value)}
                        placeholder="Ej: Astro Bunny"
                      />
                    </div>

                    <div className="dash-field">
                      <label className="dash-label">Precio (MXN)</label>
                      <input
                        className="dash-input"
                        type="number"
                        min={0}
                        value={product.price || ''}
                        onChange={(e) => updateField(product.id, 'price', Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="dash-field">
                      <label className="dash-label">Piezas disponibles</label>
                      <input
                        className="dash-input"
                        type="number"
                        min={0}
                        value={product.available || ''}
                        onChange={(e) => updateField(product.id, 'available', Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="dash-field">
                      <label className="dash-label">Descripción corta</label>
                      <textarea
                        className="dash-textarea"
                        value={product.description}
                        onChange={(e) => updateField(product.id, 'description', e.target.value)}
                        rows={2}
                        placeholder="Contá algo breve de la pieza"
                      />
                    </div>

                    <div className="dash-actions">
                      <button type="button" className="dash-btn-primary" onClick={() => setEditingId(null)}>
                        Listo
                      </button>
                      <button type="button" className="dash-btn-secondary" onClick={() => removeProduct(product.id)}>
                        Eliminar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="dash-product-summary">
                    <div className="dash-product-thumb">
                      {product.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
                        <img src={product.photos[0]} alt={product.name} />
                      ) : (
                        <span className="dash-avatar-placeholder">🖼️</span>
                      )}
                    </div>
                    <div className="dash-product-info">
                      <span className="dash-product-name">{product.name || 'Producto sin nombre'}</span>
                      <span className="dash-product-meta">
                        {product.price > 0 ? `$${product.price} MXN` : 'Sin precio'}
                        {' · '}
                        <span className={`dash-badge ${product.available > 0 ? 'available' : 'soldout'}`}>
                          {product.available > 0 ? `${product.available} disponibles` : 'Agotado'}
                        </span>
                      </span>
                    </div>
                    <div className="dash-product-actions">
                      <button type="button" className="dash-btn-secondary" onClick={() => setEditingId(product.id)}>
                        Editar
                      </button>
                      <button type="button" className="dash-btn-secondary" onClick={() => removeProduct(product.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </fieldset>
            );
          })}

          {!expired && (
            <button
              type="button"
              className="dash-btn-secondary"
              onClick={addProduct}
              disabled={atLimit}
              style={{ width: '100%', marginBottom: 18 }}
            >
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
