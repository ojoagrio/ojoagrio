'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface BackgroundOverrideValue {
  /** Non-null while some page wants to drive the background itself (e.g. the
   * dashboard's own "Fondo animado" picker) instead of BackgroundSwitcher's
   * default localStorage-driven behavior. */
  overrideMode: string | null;
  setOverrideMode: (mode: string | null) => void;
}

const BackgroundOverrideContext = createContext<BackgroundOverrideValue | null>(null);

/** Wraps the app once, in the root layout, above both BackgroundSwitcher and
 * the page content — the two are siblings, so a shared context is how a page
 * (like the dashboard's background picker) can tell BackgroundSwitcher what
 * to show instead of managing its own independent state. */
export function BackgroundOverrideProvider({ children }: { children: ReactNode }) {
  const [overrideMode, setOverrideMode] = useState<string | null>(null);
  const value = useMemo(() => ({ overrideMode, setOverrideMode }), [overrideMode]);
  return <BackgroundOverrideContext.Provider value={value}>{children}</BackgroundOverrideContext.Provider>;
}

export function useBackgroundOverride(): BackgroundOverrideValue {
  const ctx = useContext(BackgroundOverrideContext);
  if (!ctx) throw new Error('useBackgroundOverride must be used within a BackgroundOverrideProvider');
  return ctx;
}
