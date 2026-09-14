'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { isTrialExpired, type OwnArtistProfile } from '@/lib/artists';
import { SocialIcon, type SocialType } from '@ojoagrio/ui';
import { ArtistPublicView } from '@/components/ArtistPublicView';
import { saveProfile, logout, type SaveProfileState } from './actions';
import { ShareButton } from './ShareButton';
import { AvatarUpload } from './AvatarUpload';
import { ComingSoonModal } from './ComingSoonModal';
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

function daysLeft(trialEndsAt: Date | null): number | null {
  if (!trialEndsAt) return null;
  return Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function ProfileForm({
  artist,
  userId,
  isAdmin = false,
}: {
  artist: OwnArtistProfile;
  userId: string;
  isAdmin?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const [backgroundEffect, setBackgroundEffect] = useState(artist.backgroundEffect);
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarUrl);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const expired = isTrialExpired(artist.trialEndsAt);
  const remaining = daysLeft(artist.trialEndsAt);

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
        <ArtistPublicView artist={{ ...artist, avatarUrl }} reveal={false} paused={expired} />
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
            {isAdmin && (
              <Link className="dash-btn-secondary" href="/admin">
                🔑 Admin
              </Link>
            )}
          </div>
        </div>
        <p className="dash-url">
          ojoagrio.com<strong>{publicPath}</strong>
        </p>

        {remaining !== null && (
          <div className={`dash-trial-banner ${expired ? 'expired' : 'active'}`}>
            <span>
              {expired
                ? '⏸️ Tu mes gratis terminó — tu página pública quedó limitada hasta que renueves.'
                : `🎁 Te quedan ${remaining} día${remaining === 1 ? '' : 's'} de tu mes gratis.`}
            </span>
            {expired && (
              <button type="button" className="dash-btn-primary" style={{ flex: '0 0 auto' }} onClick={() => setShowComingSoon(true)}>
                Comprar plan
              </button>
            )}
          </div>
        )}

        <form action={formAction}>
          <fieldset disabled={expired} className={`dash-card${expired ? ' dash-card-disabled' : ''}`}>
            <h2 className="dash-section-title">Perfil</h2>
            <input type="hidden" name="avatarUrl" value={avatarUrl ?? ''} />
            <div className="dash-field">
              <label className="dash-label">Foto de perfil</label>
              <AvatarUpload userId={userId} initialUrl={artist.avatarUrl} onChange={setAvatarUrl} />
            </div>
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
          </fieldset>

          <fieldset disabled={expired} className={`dash-card${expired ? ' dash-card-disabled' : ''}`}>
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
          </fieldset>

          <fieldset disabled={expired} className={`dash-card${expired ? ' dash-card-disabled' : ''}`}>
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
          </fieldset>

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
            <button className="dash-btn-secondary" type="button" onClick={() => logout()}>
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
      <ComingSoonModal open={showComingSoon} onClose={() => setShowComingSoon(false)} />
    </div>
  );
}
