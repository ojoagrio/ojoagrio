'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const blob = await upload(`products/${userId}-${productId}-${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/agriolinks/api/products/upload',
      });
      const next = [...urls, blob.url];
      setUrls(next);
      onChange(next);
    } catch {
      setError('No se pudo subir la imagen. Probá con otra (JPG, PNG o WEBP, hasta 5MB).');
    } finally {
      setUploading(false);
    }
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
        <button
          type="button"
          className="dash-photo-add"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '…' : '+ Foto'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={handleFileChange}
      />
      {error && <p className="dash-message error">{error}</p>}
    </div>
  );
}
