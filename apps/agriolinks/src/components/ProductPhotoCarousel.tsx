'use client';

import { useState } from 'react';

interface Props {
  photos: string[];
  alt: string;
}

/** Small tap-to-advance photo carousel with dots — no library, just local state. */
export function ProductPhotoCarousel({ photos, alt }: Props) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="tienda-photo">
        <span className="tienda-photo-placeholder">🖼️</span>
      </div>
    );
  }

  return (
    <div className="tienda-photo">
      {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URL */}
      <img
        src={photos[index]}
        alt={alt}
        onClick={() => setIndex((index + 1) % photos.length)}
        style={{ cursor: photos.length > 1 ? 'pointer' : 'default' }}
      />
      {photos.length > 1 && (
        <div className="tienda-photo-dots">
          {photos.map((photo, i) => (
            <button
              key={photo}
              type="button"
              className={`tienda-photo-dot${i === index ? ' active' : ''}`}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
