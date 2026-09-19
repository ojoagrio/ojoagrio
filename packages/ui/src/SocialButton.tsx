import type { ReactNode } from 'react';

export type SocialType = 'instagram' | 'tiktok' | 'spotify' | 'youtube';
/** A link is either one of the branded platforms or a free-form "custom" one (own icon, own URL). */
export type LinkType = SocialType | 'custom';

interface Props {
  href: string;
  label: string;
  sub: string;
  type: LinkType;
  /** Uploaded icon — only used by 'custom' links; platform links keep their brand glyph. */
  iconUrl?: string;
  /** Set false to skip the scroll-in `.reveal` animation (e.g. inside a dashboard preview). */
  reveal?: boolean;
}

const icons: Record<LinkType, ReactNode> = {
  custom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 3c.4 2.2 1.9 3.7 4.2 3.9v2.6c-1.5 0-2.9-.4-4.2-1.3v6.1c0 3.1-2.3 5.4-5.3 5.4-3 0-5.3-2.3-5.3-5.4S5.7 9 8.7 9c.4 0 .8 0 1.1.1v2.7c-.3-.1-.7-.2-1.1-.2-1.6 0-2.8 1.2-2.8 2.8s1.2 2.8 2.8 2.8 2.9-1.2 2.9-2.8V3h2.4z" />
    </svg>
  ),
  spotify: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9.5" strokeWidth={1.6} />
      <path d="M7 10.2c3-1 7-.6 9.3.9" />
      <path d="M7.3 13c2.4-.7 5.6-.4 7.6.9" />
      <path d="M7.7 15.7c1.9-.5 4.3-.3 5.9.7" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
};

/** Just the platform glyph, for contexts that build their own layout around it (e.g. a dashboard form). */
export function SocialIcon({ type }: { type: LinkType }) {
  return <>{icons[type]}</>;
}

/** React port of SocialButton.astro — same classes, same markup shape. */
export function SocialButton({ href, label, sub, type, iconUrl, reveal = true }: Props) {
  return (
    <a
      className={`link-btn link-${type}${reveal ? ' reveal' : ''}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="link-icon">
        {type === 'custom' && iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Blob URL
          <img src={iconUrl} alt="" />
        ) : (
          icons[type]
        )}
      </span>
      <span className="link-label">
        {label}
        <span className="link-sub">{sub}</span>
      </span>
    </a>
  );
}
