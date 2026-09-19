'use client';

import { useState } from 'react';
import { SocialIcon, type LinkType } from '@ojoagrio/ui';
import type { ArtistLink } from '@/lib/types';
import { MAX_LINKS, PLATFORM_LABELS } from '@/lib/links';
import { ImageCropModal } from './ImageCropModal';

interface Row {
  id: string;
  type: LinkType;
  href: string;
  label: string;
  sub: string;
  iconUrl?: string;
}

interface Props {
  userId: string;
  initialLinks: ArtistLink[];
  fieldErrors?: Record<string, string>;
  /** Add / remove / move / new icon — the moments an autosave should be scheduled (typing is covered by the form's own onChange). */
  onStructuralChange: () => void;
}

const ADD_OPTIONS: { type: LinkType; label: string }[] = [
  { type: 'instagram', label: 'Instagram' },
  { type: 'tiktok', label: 'TikTok' },
  { type: 'spotify', label: 'Spotify' },
  { type: 'youtube', label: 'YouTube' },
  { type: 'custom', label: 'Personalizado' },
];

function typeName(type: LinkType): string {
  return type === 'custom' ? 'Personalizado' : PLATFORM_LABELS[type];
}

/**
 * One ordered list for every link (platforms and custom alike): add, delete,
 * reorder with ▲▼, and — for custom links — upload an icon. Renders hidden
 * `linkCount` / `link_{i}_*` fields that saveProfile reads via parseLinks;
 * the visible inputs carry no `name`, so the hidden mirrors are the single
 * source of what gets submitted.
 */
export function LinksEditor({ userId, initialLinks, fieldErrors, onStructuralChange }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    initialLinks.map((l, i) => ({
      // Deterministic fallback (not randomUUID) so server and client renders agree.
      id: l.id ?? `row-${i}`,
      type: l.type,
      href: l.href,
      label: l.label,
      sub: l.sub,
      iconUrl: l.iconUrl,
    }))
  );
  const [iconTargetId, setIconTargetId] = useState<string | null>(null);

  const atLimit = rows.length >= MAX_LINKS;

  function update(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function add(type: LinkType) {
    if (atLimit) return;
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, href: '', label: type === 'custom' ? '' : PLATFORM_LABELS[type], sub: '' },
    ]);
    onStructuralChange();
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    onStructuralChange();
  }

  function move(id: string, direction: -1 | 1) {
    setRows((prev) => {
      const i = prev.findIndex((r) => r.id === id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    onStructuralChange();
  }

  return (
    <>
      <input type="hidden" name="linkCount" value={rows.length} readOnly />
      {rows.map((r, i) => (
        <span key={r.id} hidden>
          <input type="hidden" name={`link_${i}_id`} value={r.id} readOnly />
          <input type="hidden" name={`link_${i}_type`} value={r.type} readOnly />
          <input type="hidden" name={`link_${i}_href`} value={r.href} readOnly />
          <input type="hidden" name={`link_${i}_label`} value={r.label} readOnly />
          <input type="hidden" name={`link_${i}_sub`} value={r.sub} readOnly />
          <input type="hidden" name={`link_${i}_icon`} value={r.iconUrl ?? ''} readOnly />
        </span>
      ))}

      {rows.length === 0 && <p className="dash-url">Todavía no cargaste links. Agregá el primero:</p>}

      {rows.map((r, i) => (
        <div key={r.id} className="dash-link-card">
          {r.type === 'custom' ? (
            <button
              type="button"
              className="dash-link-icon custom dash-link-icon-btn"
              onClick={() => setIconTargetId(r.id)}
              aria-label="Cambiar ícono del link"
            >
              {r.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
                <img src={r.iconUrl} alt="" />
              ) : (
                <SocialIcon type="custom" />
              )}
              <span className="dash-link-icon-edit">✏️</span>
            </button>
          ) : (
            <span className={`dash-link-icon ${r.type}`}>
              <SocialIcon type={r.type} />
            </span>
          )}
          <div className="dash-link-fields">
            <div className="dash-link-headrow">
              <span className="dash-link-name">{typeName(r.type)}</span>
              <span className="dash-link-tools">
                <button type="button" onClick={() => move(r.id, -1)} disabled={i === 0} aria-label="Subir">
                  ▲
                </button>
                <button type="button" onClick={() => move(r.id, 1)} disabled={i === rows.length - 1} aria-label="Bajar">
                  ▼
                </button>
                <button type="button" onClick={() => remove(r.id)} aria-label="Borrar link">
                  ✕
                </button>
              </span>
            </div>
            <input
              className="dash-input"
              value={r.href}
              onChange={(e) => update(r.id, { href: e.target.value })}
              placeholder={r.type === 'custom' ? 'https://… (vacío = oculto)' : `Link de ${typeName(r.type)} (vacío = oculto)`}
            />
            <input
              className="dash-input"
              value={r.label}
              onChange={(e) => update(r.id, { label: e.target.value })}
              placeholder={r.type === 'custom' ? 'Texto del botón (por defecto: el dominio)' : 'Texto del botón'}
            />
            <input
              className="dash-input"
              value={r.sub}
              onChange={(e) => update(r.id, { sub: e.target.value })}
              placeholder="Subtítulo (ej: @usuario)"
            />
            {fieldErrors?.[`link_${i}`] && <p className="dash-field-error">{fieldErrors[`link_${i}`]}</p>}
            {fieldErrors?.[`link_${i}_icon`] && <p className="dash-field-error">{fieldErrors[`link_${i}_icon`]}</p>}
          </div>
        </div>
      ))}

      {fieldErrors?.links && <p className="dash-field-error">{fieldErrors.links}</p>}

      <div className="dash-link-add">
        <span className="dash-link-add-label">
          Agregar ({rows.length}/{MAX_LINKS})
        </span>
        {ADD_OPTIONS.map((o) => (
          <button key={o.type} type="button" className="dash-btn-secondary" onClick={() => add(o.type)} disabled={atLimit}>
            + {o.label}
          </button>
        ))}
      </div>

      <ImageCropModal
        open={iconTargetId !== null}
        title="Ícono del link"
        uploadPath={`link-icons/${userId}-${Date.now()}.jpg`}
        uploadUrl="/agriolinks/api/link-icons/upload"
        cropShape="round"
        outputSize={128}
        onClose={() => setIconTargetId(null)}
        onUploaded={(url) => {
          if (iconTargetId) update(iconTargetId, { iconUrl: url });
          onStructuralChange();
        }}
      />
    </>
  );
}
