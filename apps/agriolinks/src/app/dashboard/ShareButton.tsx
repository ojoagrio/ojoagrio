'use client';

import { useState } from 'react';

interface Props {
  path: string;
  title: string;
  variant?: 'primary' | 'ghost';
}

export function ShareButton({ path, title, variant = 'ghost' }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user closed the share sheet — not an error
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in this context — nothing else we can do silently
    }
  }

  return (
    <button
      type="button"
      className={variant === 'primary' ? 'dash-preview-link' : 'dash-btn-secondary'}
      onClick={handleShare}
    >
      {copied ? '¡Copiado! ✅' : '🔗 Compartir'}
    </button>
  );
}
