'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { isTrialExpired, type OwnArtistProfile } from '@/lib/artists';
import type { Product } from '@/lib/types';
import { TiendaPublicView } from '@/components/TiendaPublicView';
import { ShareButton } from '../ShareButton';
import { ComingSoonModal } from '../ComingSoonModal';
import { ProductPhotosUpload } from './ProductPhotosUpload';
import { saveTienda, type SaveTiendaState } from './actions';
import '../dashboard.css';
import '@/styles/tienda.css';

const initialState: SaveTiendaState = {};

function emptyProduct(): Product {
  return { id: crypto.randomUUID(), name: '', price: 0, available: 0, description: '', photos: [] };
}

export function TiendaForm({ artist, userId }: { artist: OwnArtistProfile; userId: string }) {
  const [state, formAction, pending] = useActionState(saveTienda, initialState);
  const [products, setProducts] = useState<Product[]>(artist.products);
  const [whatsappNumber, setWhatsappNumber] = useState(artist.whatsappNumber ?? '');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  const expired = isTrialExpired(artist.trialEndsAt);
  const publicPath = `/agriolinks/u/${artist.slug}/tienda`;
  const atLimit = products.length >= artist.maxProducts;

  // Autosave, but only at deliberate "I'm done with this" moments (closing a
  // product's edit view, removing one, changing the WhatsApp number) — never
  // while actively typing into a still-incomplete product, which would
  // otherwise flash a "necesita un nombre" error before the user gets there.
  const formRef = useRef<HTMLFormElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function scheduleAutosave() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (formRef.current) formAction(new FormData(formRef.current));
    }, 1500);
  }
  useEffect(() => () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
  }, []);

  function addProduct() {
    if (atLimit) return;
    const product = emptyProduct();
    setProducts([...products, product]);
    setEditingId(product.id);
  }

  function removeProduct(id: string) {
    setProducts(products.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
    scheduleAutosave();
  }

  function updateField<K extends keyof Product>(id: string, field: K, value: Product[K]) {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  // After a failed save, jump straight to the first product that has a
  // problem instead of leaving the user to guess which of up to 6 collapsed
  // cards is the one that didn't validate.
  useEffect(() => {
    if (!state.fieldErrors) return;
    const firstBadIndex = products.findIndex((_, i) =>
      Object.keys(state.fieldErrors ?? {}).some((key) => key.startsWith(`product_${i}_`))
    );
    if (firstBadIndex >= 0) setEditingId(products[firstBadIndex].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to a new failed submission, not every products/editingId change
  }, [state.fieldErrors]);

  function productHasError(index: number): boolean {
    return Object.keys(state.fieldErrors ?? {}).some((key) => key.startsWith(`product_${index}_`));
  }

  if (view === 'preview') {
    return (
      <div className="dash-preview-shell tienda-dash">
        <div className="dash-preview-bar">
          <button type="button" className="dash-preview-back" onClick={() => setView('edit')}>
            ← Volver a editar
          </button>
          <ShareButton path={publicPath} title={`Tienda de ${artist.displayName}`} />
        </div>
        <TiendaPublicView artist={{ ...artist, products, whatsappNumber }} paused={expired} />
      </div>
    );
  }

  return (
    <div className="dash-page tienda-dash">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">
            Tu tienda{' '}
            {pending ? (
              <span className="dash-autosave-status">Guardando…</span>
            ) : state.saved ? (
              <span className="dash-autosave-status saved">Guardado ✓</span>
            ) : null}
          </h1>
          <div className="dash-topbar-actions">
            <button type="button" className="dash-preview-link" onClick={() => setView('preview')}>
              👁️ Ver mi tienda
            </button>
            <ShareButton path={publicPath} title={`Tienda de ${artist.displayName}`} />
          </div>
        </div>
        <p className="dash-url">
          ojoagrio.com<strong>{publicPath}</strong>
        </p>
        <p className="dash-stats-row">
          👁️ {artist.viewCount} visita{artist.viewCount === 1 ? '' : 's'}
          {' · '}
          💬 {artist.buyClickCount} click{artist.buyClickCount === 1 ? '' : 's'} en Comprar
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

        <form action={formAction} ref={formRef}>
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
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  scheduleAutosave();
                }}
                placeholder="521XXXXXXXXXX"
              />
              {state.fieldErrors?.whatsappNumber && <p className="dash-field-error">{state.fieldErrors.whatsappNumber}</p>}
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
                      {state.fieldErrors?.[`product_${index}_photos`] && (
                        <p className="dash-field-error">{state.fieldErrors[`product_${index}_photos`]}</p>
                      )}
                    </div>

                    <div className="dash-field">
                      <label className="dash-label">Nombre</label>
                      <input
                        className="dash-input"
                        value={product.name}
                        onChange={(e) => updateField(product.id, 'name', e.target.value)}
                        placeholder="Ej: Astro Bunny"
                      />
                      {state.fieldErrors?.[`product_${index}_name`] && (
                        <p className="dash-field-error">{state.fieldErrors[`product_${index}_name`]}</p>
                      )}
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
                      {state.fieldErrors?.[`product_${index}_price`] && (
                        <p className="dash-field-error">{state.fieldErrors[`product_${index}_price`]}</p>
                      )}
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
                      {state.fieldErrors?.[`product_${index}_available`] && (
                        <p className="dash-field-error">{state.fieldErrors[`product_${index}_available`]}</p>
                      )}
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
                      <button
                        type="button"
                        className="dash-btn-primary"
                        onClick={() => {
                          setEditingId(null);
                          scheduleAutosave();
                        }}
                      >
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
                      <span className="dash-product-name">
                        {productHasError(index) && <span aria-label="Tiene un error">⚠️ </span>}
                        {product.name || 'Producto sin nombre'}
                      </span>
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
          {state.fieldErrors && (
            <p className="dash-message error">Revisá los campos marcados con ⚠️ antes de guardar.</p>
          )}

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
