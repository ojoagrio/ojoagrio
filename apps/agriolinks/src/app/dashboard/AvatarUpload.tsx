'use client';

import { useState } from 'react';
import { AvatarCropModal } from './AvatarCropModal';

interface Props {
  userId: string;
  initialUrl: string | null;
  /** Kept in sync so the parent form submits it as a normal field on save. */
  onChange: (url: string | null) => void;
}

export function AvatarUpload({ userId, initialUrl, onChange }: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="dash-avatar-circle-wrap">
        <div className="dash-avatar-preview">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Blob URL, no next/image domain config needed
            <img src={url} alt="Tu foto de perfil" />
          ) : (
            <span className="dash-avatar-placeholder">🎤</span>
          )}
        </div>
        <button
          type="button"
          className="dash-avatar-edit"
          onClick={() => setModalOpen(true)}
          aria-label="Editar foto de perfil"
        >
          ✏️
        </button>
      </div>

      <AvatarCropModal
        open={modalOpen}
        userId={userId}
        onClose={() => setModalOpen(false)}
        onUploaded={(newUrl) => {
          setUrl(newUrl);
          onChange(newUrl);
        }}
      />
    </>
  );
}
