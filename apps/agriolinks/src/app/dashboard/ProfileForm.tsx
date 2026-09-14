'use client';

import { useActionState, useState } from 'react';
import type { OwnArtistProfile } from '@/lib/artists';
import { SocialIcon, type SocialType } from '@ojoagrio/ui';
import { ArtistPublicView } from '@/components/ArtistPublicView';
import { saveProfile, logout, type SaveProfileState } from './actions';
import { ShareButton } from './ShareButton';
import './dashboard.css';

const SOCIAL_TYPES: { type: SocialType; label: string }[] = [
  { type: 'instagram', label: 'Instagram' },
  { type: 'tiktok', label: 'TikTok' },
  { type: 'spotify', label: 'Spotify' },
  { type: 'youtube', label: 'YouTube' },
];

const BACKGROUND_OPTIONS = [
  { value: 'liquid', label: '💧 Líquido' },
  { value: 'fog', label: '🌫️ Bruma' },
  { value: 'cells', label: '🫧 Células' },
  { value: 'net', label: '🕸️ Red' },
  { value: 'halo', label: '🌀 Halo' },
  { value: 'globe', label: '🌐 Globo' },
];

const initialState: SaveProfileState = {};

export function ProfileForm({ artist }: { artist: OwnArtistProfile }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const [backgroundEffect, setBackgroundEffect] = useState(artist.backgroundEffect);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  const linkByType = Object.fromEntries(artist.links.map((l) => [l.type, l]));
  const publicPath = `/agriolinks/u/${artist.slug}`;

  if (view === 'preview') {
    return (
      <div className="dash-preview-shell">
        <div className="dash-preview-bar">
          <button type="button" className="dash-preview-back" onClick={() => setView('edit')}>
            ← Volver a editar
          </button>
          <ShareButton path={publicPath} title={artist.displayName} />
        </div>
        <ArtistPublicView artist={artist} reveal={false} />
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">Tu página</h1>
          <div className="dash-topbar-actions">
            <button type="button" className="dash-preview-link" onClick={() => setView('preview')}>
              👁️ Ver mi página
            </button>
            <ShareButton path={publicPath} title={artist.displayName} />
          </div>
        </div>
        <p className="dash-url">
          ojoagrio.com<strong>{publicPath}</strong>
        </p>

        <form action={formAction}>
          <div className="dash-card">
            <h2 className="dash-section-title">Perfil</h2>
            <div className="dash-field">
              <label className="dash-label" htmlFor="displayName">
                Nombre artístico
              </label>
              <input
                id="displayName"
                className="dash-input"
                name="displayName"
                defaultValue={artist.displayName}
                placeholder="Tu nombre artístico"
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-label" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                className="dash-textarea"
                name="bio"
                defaultValue={artist.bio}
                placeholder="Contá quién sos en un par de líneas"
                rows={3}
              />
            </div>
          </div>

          <div className="dash-card">
            <h2 className="dash-section-title">Fondo animado</h2>
            <input type="hidden" name="backgroundEffect" value={backgroundEffect} />
            <div className="dash-bg-grid">
              {BACKGROUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="dash-bg-option"
                  data-selected={backgroundEffect === opt.value}
                  onClick={() => setBackgroundEffect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dash-card">
            <h2 className="dash-section-title">Tus links</h2>
            {SOCIAL_TYPES.map(({ type, label }) => (
              <div key={type} className="dash-link-card">
                <span className={`dash-link-icon ${type}`}>
                  <SocialIcon type={type} />
                </span>
                <div className="dash-link-fields">
                  <span className="dash-link-name">{label}</span>
                  <input
                    className="dash-input"
                    name={`link_${type}_href`}
                    defaultValue={linkByType[type]?.href ?? ''}
                    placeholder={`Link de ${label} (vacío = oculto)`}
                  />
                  <input
                    className="dash-input"
                    name={`link_${type}_label`}
                    defaultValue={linkByType[type]?.label ?? label}
                    placeholder="Texto del botón"
                  />
                  <input
                    className="dash-input"
                    name={`link_${type}_sub`}
                    defaultValue={linkByType[type]?.sub ?? ''}
                    placeholder="Subtítulo (ej: @usuario)"
                  />
                </div>
              </div>
            ))}
          </div>

          {state.error && <p className="dash-message error">{state.error}</p>}
          {state.saved && <p className="dash-message success">Guardado ✅</p>}

          <div className="dash-actions">
            <button className="dash-btn-primary" type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button className="dash-btn-secondary" type="button" onClick={() => logout()}>
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
