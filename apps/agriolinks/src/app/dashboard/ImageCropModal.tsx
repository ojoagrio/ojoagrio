'use client';

import { useEffect, useRef, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { upload } from '@vercel/blob/client';
import { getCroppedImageBlob } from '@/lib/cropImage';

interface Props {
  open: boolean;
  title: string;
  /** Vercel Blob pathname to upload the cropped image to, e.g. `avatars/${userId}-${Date.now()}.jpg`. */
  uploadPath: string;
  /** Token-generation endpoint for this upload, e.g. '/agriolinks/api/avatar/upload'. */
  uploadUrl: string;
  cropShape?: 'round' | 'rect';
  /** Side of the square output in px — small icons don't need the 512 default. */
  outputSize?: number;
  onClose: () => void;
  onUploaded: (url: string) => void;
}

export function ImageCropModal({ open, title, uploadPath, uploadUrl, cropShape = 'rect', outputSize, onClose, onUploaded }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      setError(null);
      setUploading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!imageSrc || !croppedArea) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedArea, outputSize);
      const result = await upload(uploadPath, blob, {
        access: 'public',
        handleUploadUrl: uploadUrl,
      });
      onUploaded(result.url);
      onClose();
    } catch {
      setError('No se pudo subir la imagen. Probá con otra (JPG, PNG o WEBP, hasta 5MB).');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="dash-modal-overlay" onClick={onClose}>
      <div
        className="dash-modal dash-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dash-section-title" id="image-crop-title">
          {title}
        </h2>

        {!imageSrc ? (
          <>
            <p className="dash-modal-text">Elegí una imagen.</p>
            <div className="dash-actions">
              <button className="dash-btn-primary" type="button" onClick={() => fileInputRef.current?.click()}>
                Elegir imagen
              </button>
              <button className="dash-btn-secondary" type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="dash-crop-area">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape={cropShape}
                showGrid={cropShape === 'rect'}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
              />
            </div>
            <input
              className="dash-crop-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
            />
            {error && <p className="dash-message error">{error}</p>}
            <div className="dash-actions">
              <button className="dash-btn-primary" type="button" onClick={handleSave} disabled={uploading}>
                {uploading ? 'Guardando…' : 'Guardar'}
              </button>
              <button className="dash-btn-secondary" type="button" onClick={() => setImageSrc(null)} disabled={uploading}>
                Elegir otra
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
