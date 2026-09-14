'use client';

import { useState } from 'react';
import { ImageCropModal } from '../ImageCropModal';

interface Props {
  userId: string;
  productId: string;
  initialUrls: string[];
  /** Kept in sync so the parent form submits it as a hidden field on save. */
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ProductPhotosUpload({ userId, productId, initialUrls, onChange, max = 3 }: Props) {
  const [urls, setUrls] = useState(initialUrls);
  const [modalOpen, setModalOpen] = useState(false);

  function addPhoto(url: string) {
    const next = [...urls, url];
    setUrls(next);
    onChange(next);
  }

  function removePhoto(url: string) {
    const next = urls.filter((u) => u !== url);
    setUrls(next);
    onChange(next);
  }

  return (
    <div className="dash-photos-row">
      {urls.map((url) => (
        <div className="dash-photo-thumb" key={url}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URL */}
          <img src={url} alt="Foto del producto" />
          <button type="button" className="dash-photo-remove" onClick={() => removePhoto(url)} aria-label="Quitar foto">
            ✕
          </button>
        </div>
      ))}
      {urls.length < max && (
        <button type="button" className="dash-photo-add" onClick={() => setModalOpen(true)}>
          + Foto
        </button>
      )}

      <ImageCropModal
        open={modalOpen}
        title="Foto del producto"
        uploadPath={`products/${userId}-${productId}-${Date.now()}.jpg`}
        uploadUrl="/agriolinks/api/products/upload"
        cropShape="rect"
        onClose={() => setModalOpen(false)}
        onUploaded={addPhoto}
      />
    </div>
  );
}
