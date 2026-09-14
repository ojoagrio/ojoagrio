'use client';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="dash-section-title">🚧 Próximamente</h2>
        <p className="dash-modal-text">
          Todavía no está lista la compra online de tu plan — muy pronto vas a poder renovarlo
          acá mismo. Mientras tanto, contactá a quien te invitó a AgrioLinks para seguir activo.
        </p>
        <div className="dash-actions">
          <button className="dash-btn-primary" type="button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
