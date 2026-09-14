'use client';

import { useActionState } from 'react';
import type { OwnArtistProfile } from '@/lib/artists';
import type { SocialType } from '@ojoagrio/ui';
import { saveProfile, logout, type SaveProfileState } from './actions';

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

  const linkByType = Object.fromEntries(artist.links.map((l) => [l.type, l]));

  return (
    <form className="links" action={formAction}>
      <p className="subtitle">Tu página: agriolinks.ojoagrio.com/u/{artist.slug}</p>

      <input className="link-btn" name="displayName" defaultValue={artist.displayName} placeholder="Tu nombre artístico" required />
      <textarea className="bio" name="bio" defaultValue={artist.bio} placeholder="Tu bio" rows={3} />

      <label className="bg-select-label" htmlFor="backgroundEffect">
        Fondo animado
      </label>
      <select id="backgroundEffect" name="backgroundEffect" className="link-btn" defaultValue={artist.backgroundEffect}>
        {BACKGROUND_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {SOCIAL_TYPES.map(({ type, label }) => (
        <fieldset key={type} className="link-btn" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <legend>{label}</legend>
          <input name={`link_${type}_href`} defaultValue={linkByType[type]?.href ?? ''} placeholder={`Link de ${label} (vacío = oculto)`} />
          <input name={`link_${type}_label`} defaultValue={linkByType[type]?.label ?? label} placeholder="Texto del botón" />
          <input name={`link_${type}_sub`} defaultValue={linkByType[type]?.sub ?? ''} placeholder="Subtítulo (ej: @usuario)" />
        </fieldset>
      ))}

      {state.error && <p className="bio">{state.error}</p>}
      {state.saved && <p className="bio">Guardado ✅</p>}

      <button className="link-btn" type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
      <button className="link-btn" type="button" onClick={() => logout()}>
        Cerrar sesión
      </button>
    </form>
  );
}
