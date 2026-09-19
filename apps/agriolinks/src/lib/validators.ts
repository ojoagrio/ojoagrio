/** Only plain web links — blocks javascript:, data:, ftp: and friends (stored XSS via a link's href). */
export function isValidLinkHref(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** A real Vercel Blob public URL — checks the parsed hostname, not a substring an attacker could smuggle into a query string. */
export function isValidBlobUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}
