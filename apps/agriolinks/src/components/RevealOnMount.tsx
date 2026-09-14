'use client';

import type { ReactNode } from 'react';
import { useRevealOnScroll } from '@ojoagrio/ui';

/** Thin client boundary so server-rendered pages can still use the `.reveal` scroll-in animation. */
export function RevealOnMount({ children }: { children: ReactNode }) {
  useRevealOnScroll();
  return <>{children}</>;
}
