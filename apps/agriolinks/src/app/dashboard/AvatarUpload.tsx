'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

interface Props {
  userId: string;
  initialUrl: string | null;
  /** Kept in sync so the parent form submits it as a normal field on save. */
  onChange: (url: string | null) => void;
}

export function AvatarUpload({ userId, initialUrl, onChange }: Props) {
  const [url, setUrl] = useState(initialUrl);
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
      const blob = await upload(`avatars/${userId}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/agriolinks/api/avatar/upload',
      });
      setUrl(blob.url);
      onChange(blob.url);
    } catch {
      setError('No se pudo subir la imagen. Probá con otra (JPG, PNG o WEBP, hasta 5MB).');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="dash-avatar-row">
      <div className="dash-avatar-preview">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Blob URL, no next/image domain config needed
          <img src={url} alt="Tu foto de perfil" />
        ) : (
          <span className="dash-avatar-placeholder">🎤</span>
        )}
      </div>
      <div>
        <button type="button" className="dash-btn-secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Subiendo…' : url ? 'Cambiar foto' : 'Subir foto'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleFileChange}
        />
        {error && <p className="dash-message error">{error}</p>}
      </div>
    </div>
  );
}
