'use client';

import { useEffect } from 'react';

/**
 * React port of the IntersectionObserver block from Layout.astro's inline
 * script: elements with the `.reveal` class pop in once, then drop the
 * `reveal`/`in-view` classes so their own hover/active transitions take over.
 * Call once per page after its `.reveal` elements have mounted.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.add('in-view');
            el.addEventListener(
              'animationend',
              () => {
                el.classList.remove('reveal', 'in-view');
              },
              { once: true }
            );
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
