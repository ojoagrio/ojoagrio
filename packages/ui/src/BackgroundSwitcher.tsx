'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useBackgroundOverride } from './BackgroundOverrideContext';

const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
const VANTA_BASE = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/';
const STORAGE_KEY = 'ojoagrio-bg-fx';
const MODES = ['liquid', 'fog', 'cells', 'net', 'halo', 'globe'] as const;
// The landing page cycles through a fixed, curated subset with no picker —
// the full 6-effect switcher belongs on the artist's own pages.
const LANDING_MODES: readonly Mode[] = ['net', 'halo', 'fog'];
const AUTO_MS = 5000;

type Mode = (typeof MODES)[number];

interface Props {
  /** Text shown in the mini pill next to the picker, e.g. "👁️ OJOAGRIO". */
  brandLabel?: string;
}

/**
 * React port of the inline Vanta.js background switcher that used to live in
 * Layout.astro's <script is:inline>. Same effects, same CDN sources, same
 * localStorage key, so a viewer's chosen background carries over between
 * ojoagrio.com and agriolinks pages.
 */
export function BackgroundSwitcher({ brandLabel = '👁️ OJOAGRIO' }: Props) {
  const vantaElRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const currentModeRef = useRef<Mode>('liquid');
  // Small marketing previews embed a page in an <iframe> (e.g. the phone
  // mockup on the AgrioLinks landing page) just to show the layout — running
  // a second full Three.js/Vanta engine in there, plus the switcher control,
  // is wasted load and clutter. A flat gradient stands in instead.
  const [isEmbedded, setIsEmbedded] = useState(false);

  // The landing page ("/") gets a fixed, curated background with no picker —
  // everywhere else keeps the full switcher. The minimalist "tienda" product
  // pages opt out of the animated background entirely (their own flat dark
  // background lives in tienda.css).
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isStorePage = pathname?.endsWith('/tienda') ?? false;
  const allowedModes = isLandingPage ? LANDING_MODES : MODES;

  // A page can drive the background itself instead of the default
  // localStorage-based picker (the dashboard's own "Fondo animado" chips do
  // this) — when it does, hide this component's own picker entirely and just
  // follow whatever mode it sets, live.
  const { overrideMode } = useBackgroundOverride();
  const showPicker = !isLandingPage && !isStorePage && !overrideMode;

  useEffect(() => {
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      setIsEmbedded(true); // cross-origin access throws — that's an iframe too
    }
  }, []);

  useEffect(() => {
    const vantaEl = vantaElRef.current;
    if (!vantaEl || isEmbedded || isStorePage) return;
    const select = selectRef.current;

    let vantaEffect: { destroy: () => void } | null = null;
    let autoTimer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    function loadScript(src: string) {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    function stopAll() {
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch {
          // effect already torn down
        }
        vantaEffect = null;
      }
      if (vantaEl) vantaEl.style.display = 'none';
    }

    function ensureThree() {
      // @ts-expect-error loaded onto window by the CDN script
      if (window.THREE) return Promise.resolve();
      return loadScript(THREE_SRC);
    }

    function startEffect(mode: Mode) {
      if (!vantaEl) return;
      vantaEl.style.display = 'block';
      const file =
        mode === 'fog'
          ? 'vanta.fog.min.js'
          : mode === 'cells'
            ? 'vanta.cells.min.js'
            : mode === 'net'
              ? 'vanta.net.min.js'
              : mode === 'halo'
                ? 'vanta.halo.min.js'
                : mode === 'globe'
                  ? 'vanta.globe.min.js'
                  : 'vanta.waves.min.js';
      const vantaKey =
        mode === 'fog'
          ? 'FOG'
          : mode === 'cells'
            ? 'CELLS'
            : mode === 'net'
              ? 'NET'
              : mode === 'halo'
                ? 'HALO'
                : mode === 'globe'
                  ? 'GLOBE'
                  : 'WAVES';

      ensureThree()
        .then(() => {
          // @ts-expect-error loaded onto window by the CDN script
          if (window.VANTA?.[vantaKey]) return;
          return loadScript(VANTA_BASE + file);
        })
        .then(() => {
          if (cancelled || !vantaEl) return;
          // @ts-expect-error loaded onto window by the CDN script
          const VANTA = window.VANTA;
          const options = { el: vantaEl, mouseControls: true, touchControls: true, gyroControls: false };
          if (mode === 'fog') {
            vantaEffect = VANTA.FOG({
              ...options,
              highlightColor: 0xffb347,
              midtoneColor: 0xff6b4a,
              lowlightColor: 0xe4007c,
              baseColor: 0x241a2e,
              blurFactor: 0.6,
              speed: 1.6,
              zoom: 1,
            });
          } else if (mode === 'cells') {
            vantaEffect = VANTA.CELLS({ ...options, color1: 0xff6b4a, color2: 0x2ec4b6, size: 1.6, speed: 1.1 });
          } else if (mode === 'net') {
            vantaEffect = VANTA.NET({
              ...options,
              color: 0x2ec4b6,
              backgroundColor: 0x241a2e,
              points: 10,
              maxDistance: 22,
              spacing: 16,
            });
          } else if (mode === 'halo') {
            vantaEffect = VANTA.HALO({
              ...options,
              baseColor: 0xe4007c,
              backgroundColor: 0x241a2e,
              amplitudeFactor: 2,
              size: 1.4,
            });
          } else if (mode === 'globe') {
            vantaEffect = VANTA.GLOBE({
              ...options,
              color: 0xffb347,
              color2: 0xe4007c,
              size: 1.2,
              backgroundColor: 0x241a2e,
            });
          } else {
            vantaEffect = VANTA.WAVES({
              ...options,
              color: 0xe4007c,
              shininess: 60,
              waveHeight: 22,
              waveSpeed: 1.15,
              zoom: 0.85,
            });
          }
        });
    }

    function activate(mode: Mode) {
      stopAll();
      startEffect(mode);
      currentModeRef.current = mode;
      if (select) select.value = mode;
      if (!overrideMode) {
        try {
          localStorage.setItem(STORAGE_KEY, mode);
        } catch {
          // storage unavailable (private mode, etc.) — non-fatal
        }
      }
    }

    if (overrideMode) {
      // Fully controlled by another page — no picker, no auto-cycle, no
      // localStorage. Re-runs (via the dependency array below) whenever the
      // controlling page changes its selection.
      activate(overrideMode as Mode);
      return () => {
        cancelled = true;
        stopAll();
      };
    }

    function restartAutoCycle() {
      if (autoTimer) clearInterval(autoTimer);
      // Pages with a manual picker (login, signup, dashboard, the artist's
      // own page) keep whatever background is active — the first default or
      // whatever the user picked — fixed, with no auto-advance. Only the
      // landing's curated, picker-less background cycles on a timer.
      if (showPicker) return;
      autoTimer = setInterval(() => {
        const idx = allowedModes.indexOf(currentModeRef.current);
        const next = allowedModes[(idx + 1) % allowedModes.length];
        activate(next);
      }, AUTO_MS);
    }

    function onChange() {
      activate((select?.value as Mode) ?? allowedModes[0]);
      restartAutoCycle();
    }

    select?.addEventListener('change', onChange);

    let saved: Mode = allowedModes[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
      if (stored && (allowedModes as readonly string[]).includes(stored)) saved = stored;
    } catch {
      // storage unavailable — default to the first allowed mode
    }
    activate(saved);
    restartAutoCycle();

    return () => {
      cancelled = true;
      select?.removeEventListener('change', onChange);
      if (autoTimer) clearInterval(autoTimer);
      stopAll();
    };
  }, [isEmbedded, isLandingPage, isStorePage, allowedModes, overrideMode]);

  if (isStorePage) {
    // The tienda pages render their own flat dark background (tienda.css) —
    // no bg-layer, no switcher, no Vanta/Three.js load at all.
    return null;
  }

  if (isEmbedded) {
    return (
      <div
        className="bg-layer"
        style={{ background: 'linear-gradient(135deg, #241a2e 0%, #4a3b52 100%)' }}
      />
    );
  }

  return (
    <>
      <div ref={vantaElRef} id="vanta-bg" className="bg-layer" />
      {showPicker && (
        <div className="bg-switcher">
          <div className="bg-switcher-pill">
            <span className="mini-brand">{brandLabel}</span>
            <span className="pill-divider" />
            <label htmlFor="bg-select" className="bg-select-label">
              🎨
            </label>
            <select ref={selectRef} id="bg-select" className="bg-select" aria-label="Elegir fondo animado" defaultValue="liquid">
              <option value="liquid">💧 Líquido</option>
              <option value="fog">🌫️ Bruma</option>
              <option value="cells">🫧 Células</option>
              <option value="net">🕸️ Red</option>
              <option value="halo">🌀 Halo</option>
              <option value="globe">🌐 Globo</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}
