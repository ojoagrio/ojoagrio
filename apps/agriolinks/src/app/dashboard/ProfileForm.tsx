'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { isTrialExpired, isSuspended, type OwnArtistProfile } from '@/lib/artists';
import { useBackgroundOverride } from '@ojoagrio/ui';
import { ArtistPublicView } from '@/components/ArtistPublicView';
import { saveProfile, logout, type SaveProfileState } from './actions';
import { ShareButton } from './ShareButton';
import { AvatarUpload } from './AvatarUpload';
import { ComingSoonModal } from './ComingSoonModal';
import { OnboardingChecklist } from './OnboardingChecklist';
import { LinksEditor } from './LinksEditor';
import { activeLinks } from '@/lib/links';
import './dashboard.css';

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

  // Autosave: any change inside the form (typing, background pick, avatar
  // upload) schedules the same saveProfile action a moment after the user
  // stops — the explicit "Guardar cambios" button stays as a backup.
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

  // Drive the shared animated background from this page's own "Fondo
  // animado" picker instead of BackgroundSwitcher's independent
  // localStorage-based one — no separate floating picker, no auto-cycle,
  // just whatever's selected here, live.
  const { setOverrideMode } = useBackgroundOverride();
  useEffect(() => {
    setOverrideMode(backgroundEffect);
  }, [backgroundEffect, setOverrideMode]);
  useEffect(() => () => setOverrideMode(null), [setOverrideMode]);

  const trialExpired = isTrialExpired(artist.trialEndsAt);
  const suspended = isSuspended(artist);
  const remaining = daysLeft(artist.trialEndsAt);

  const filledLinks = activeLinks(artist.links);
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
        <ArtistPublicView artist={{ ...artist, links: filledLinks, avatarUrl }} reveal={false} paused={suspended} />
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-container">
        <div className="dash-topbar">
          <h1 className="dash-title">
            Tu página{' '}
            {pending ? (
              <span className="dash-autosave-status">Guardando…</span>
            ) : state.saved ? (
              <span className="dash-autosave-status saved">Guardado ✓</span>
            ) : null}
          </h1>
          <div className="dash-topbar-actions">
            <button type="button" className="dash-preview-link" onClick={() => setView('preview')}>
              👁️ Ver mi página
            </button>
            <ShareButton path={publicPath} title={artist.displayName} />
            <Link className="dash-btn-secondary" href="/dashboard/tienda">
              🛍️ Tienda
            </Link>
            {isAdmin && (
              <Link className="dash-btn-secondary" href="/admin/analytics">
                🔑 Admin
              </Link>
            )}
          </div>
        </div>
        <p className="dash-url">
          ojoagrio.com<strong>{publicPath}</strong>
        </p>
        <p className="dash-stats-row">
          👁️ {artist.viewCount} visita{artist.viewCount === 1 ? '' : 's'}
          {' · '}
          🔗 {filledLinks.length} link{filledLinks.length === 1 ? '' : 's'} activo{filledLinks.length === 1 ? '' : 's'}
          {' · '}
          🛍️ {artist.products.length} producto{artist.products.length === 1 ? '' : 's'}
        </p>

        <OnboardingChecklist artist={artist} />

        {(remaining !== null || artist.isBlocked) && (
          <div className={`dash-trial-banner ${suspended ? 'expired' : 'active'}`}>
            <span>
              {artist.isBlocked
                ? '🚫 Tu cuenta fue bloqueada. Contactá a quien administra AgrioLinks para reactivarla.'
                : trialExpired
                  ? '⏸️ Tu mes gratis terminó — tu página pública quedó limitada hasta que renueves.'
                  : `🎁 Te quedan ${remaining} día${remaining === 1 ? '' : 's'} de tu mes gratis.`}
            </span>
            {trialExpired && !artist.isBlocked && (
              <button type="button" className="dash-btn-primary" style={{ flex: '0 0 auto' }} onClick={() => setShowComingSoon(true)}>
                Comprar plan
              </button>
            )}
          </div>
        )}

        <form action={formAction} ref={formRef} onChange={scheduleAutosave}>
          <fieldset disabled={suspended} className={`dash-card${suspended ? ' dash-card-disabled' : ''}`}>
            <h2 className="dash-section-title">Perfil</h2>
            <input type="hidden" name="avatarUrl" value={avatarUrl ?? ''} />
            <div className="dash-field">
              <label className="dash-label">Foto de perfil</label>
              <AvatarUpload
                userId={userId}
                initialUrl={artist.avatarUrl}
                onChange={(url) => {
                  setAvatarUrl(url);
                  scheduleAutosave();
                }}
              />
              {state.fieldErrors?.avatarUrl && <p className="dash-field-error">{state.fieldErrors.avatarUrl}</p>}
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
              {state.fieldErrors?.displayName && <p className="dash-field-error">{state.fieldErrors.displayName}</p>}
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

          <fieldset disabled={suspended} className={`dash-card${suspended ? ' dash-card-disabled' : ''}`}>
            <h2 className="dash-section-title">Fondo animado</h2>
            <input type="hidden" name="backgroundEffect" value={backgroundEffect} />
            <div className="dash-bg-grid">
              {BACKGROUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="dash-bg-option"
                  data-selected={backgroundEffect === opt.value}
                  onClick={() => {
                    setBackgroundEffect(opt.value);
                    scheduleAutosave();
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={suspended} className={`dash-card${suspended ? ' dash-card-disabled' : ''}`}>
            <h2 className="dash-section-title">Tus links</h2>
            <LinksEditor
              userId={userId}
              initialLinks={artist.links}
              fieldErrors={state.fieldErrors}
              onStructuralChange={scheduleAutosave}
            />
          </fieldset>

          {state.error && <p className="dash-message error">{state.error}</p>}

          <div className="dash-actions">
            {artist.isBlocked ? (
              <button className="dash-btn-primary" type="button" disabled>
                Cuenta bloqueada
              </button>
            ) : trialExpired ? (
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
