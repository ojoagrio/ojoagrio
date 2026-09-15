'use client';

interface Props {
  href: string;
  slug: string;
}

/** Same "Comprar por WhatsApp" link as before, plus a fire-and-forget click count — own analytics, no third-party pixel. */
export function BuyButton({ href, slug }: Props) {
  function track() {
    try {
      const body = new Blob([JSON.stringify({ slug })], { type: 'application/json' });
      navigator.sendBeacon('/agriolinks/api/track/buy-click', body);
    } catch {
      // best-effort — never block the actual WhatsApp link
    }
  }

  return (
    <a className="tienda-buy" href={href} target="_blank" rel="noopener noreferrer" onClick={track}>
      Comprar por WhatsApp
    </a>
  );
}
