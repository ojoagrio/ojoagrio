'use client';

import { useState } from 'react';
import type { OwnArtistProfile } from '@/lib/artists';
import { activeLinks } from '@/lib/links';

interface Item {
  label: string;
  done: boolean;
}

function buildItems(artist: OwnArtistProfile): Item[] {
  return [
    { label: 'Subí tu foto de perfil', done: !!artist.avatarUrl },
    { label: 'Contá algo en tu bio', done: artist.bio.trim().length > 0 },
    { label: 'Cargá al menos un link', done: activeLinks(artist.links).length > 0 },
  ];
}

/** Shows what's left to finish a usable page — disappears once everything's done. */
export function OnboardingChecklist({ artist }: { artist: OwnArtistProfile }) {
  const [dismissed, setDismissed] = useState(false);
  const items = buildItems(artist);
  const pending = items.filter((i) => !i.done);

  if (dismissed || pending.length === 0) return null;

  return (
    <div className="dash-onboarding">
      <div className="dash-onboarding-header">
        <span>🚀 Te faltan {pending.length} paso{pending.length === 1 ? '' : 's'} para tener tu página lista</span>
        <button type="button" className="dash-onboarding-dismiss" onClick={() => setDismissed(true)} aria-label="Cerrar">
          ✕
        </button>
      </div>
      <ul className="dash-onboarding-list">
        {items.map((item) => (
          <li key={item.label} className={item.done ? 'done' : ''}>
            <span className="dash-onboarding-check">{item.done ? '✅' : '⬜'}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
