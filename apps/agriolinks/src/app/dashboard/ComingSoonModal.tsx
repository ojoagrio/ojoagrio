'use client';

import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ open, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div
        className="dash-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dash-section-title" id="coming-soon-title">
          🚧 Próximamente
        </h2>
        <p className="dash-modal-text">
          Todavía no está lista la compra online de tu plan — muy pronto vas a poder renovarlo
          acá mismo. Mientras tanto, contactá a quien te invitó a AgrioLinks para seguir activo.
        </p>
        <div className="dash-actions">
          <button className="dash-btn-primary" type="button" onClick={onClose} ref={closeButtonRef}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
