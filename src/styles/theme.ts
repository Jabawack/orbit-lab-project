'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeName = 'cosmic' | 'minimal' | 'topographic';

export interface Theme {
  name: ThemeName;
  // Panel + UI colors
  bg: string;
  panel: string;
  panelSolid: string;
  accent: string;
  accentContrast: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  borderStrong: string;
  // Globe colors
  polygonCap: string;
  polygonSide: string;
  polygonStroke: string;
  globeBase: string;
  atmosphere: string;
  backgroundImage: string | null;
}

export const themes: Record<ThemeName, Theme> = {
  cosmic: {
    name: 'cosmic',
    bg: '#000000',
    panel: 'rgba(0, 0, 0, 0.85)',
    panelSolid: '#0a0a0a',
    accent: '#3b82f6',
    accentContrast: '#ffffff',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textFaint: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderStrong: 'rgba(255, 255, 255, 0.2)',
    polygonCap: 'rgba(40, 40, 60, 0.6)',
    polygonSide: 'rgba(0, 0, 0, 0)',
    polygonStroke: 'rgba(255, 255, 255, 0.15)',
    globeBase: '#0a0a1a',
    atmosphere: '#3a228a',
    backgroundImage: '//unpkg.com/three-globe/example/img/night-sky.png',
  },
  minimal: {
    name: 'minimal',
    bg: '#f5f5f5',
    panel: 'rgba(255, 255, 255, 0.92)',
    panelSolid: '#ffffff',
    accent: '#111111',
    accentContrast: '#ffffff',
    text: '#111111',
    textMuted: 'rgba(0, 0, 0, 0.55)',
    textFaint: 'rgba(0, 0, 0, 0.35)',
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.18)',
    polygonCap: 'rgba(220, 220, 225, 0.85)',
    polygonSide: 'rgba(0, 0, 0, 0)',
    polygonStroke: 'rgba(0, 0, 0, 0.25)',
    globeBase: '#ffffff',
    atmosphere: '#cccccc',
    backgroundImage: null,
  },
  topographic: {
    name: 'topographic',
    bg: '#1a1612',
    panel: 'rgba(26, 22, 18, 0.92)',
    panelSolid: '#1a1612',
    accent: '#d4a017',
    accentContrast: '#1a1612',
    text: '#f4e4bc',
    textMuted: 'rgba(244, 228, 188, 0.55)',
    textFaint: 'rgba(244, 228, 188, 0.35)',
    border: 'rgba(212, 160, 23, 0.15)',
    borderStrong: 'rgba(212, 160, 23, 0.35)',
    polygonCap: 'rgba(90, 70, 40, 0.7)',
    polygonSide: 'rgba(0, 0, 0, 0)',
    polygonStroke: 'rgba(212, 160, 23, 0.3)',
    globeBase: '#2a1e14',
    atmosphere: '#7a5a2a',
    backgroundImage: null,
  },
};

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'orbit-lab:theme';

function applyCssVars(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--panel', theme.panel);
  root.style.setProperty('--panel-solid', theme.panelSolid);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-contrast', theme.accentContrast);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--text-faint', theme.textFaint);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--border-strong', theme.borderStrong);
}

interface ThemeProviderProps {
  defaultTheme?: ThemeName;
  children: React.ReactNode;
}

export function ThemeProvider({ defaultTheme = 'cosmic', children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored && stored in themes) {
      // Hydrate persisted theme after mount. Runs once; no cascading renders.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeName(stored as ThemeName);
    }
  }, []);

  useEffect(() => {
    applyCssVars(themes[themeName]);
  }, [themeName]);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeName(name);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, name);
    }
  }, []);

  const value: ThemeContextValue = {
    theme: themes[themeName],
    themeName,
    setTheme,
  };

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
