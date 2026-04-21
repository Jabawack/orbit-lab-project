'use client';

import React from 'react';
import type { RegionKey } from '@/lib/api/opensky';

interface TopBarProps {
  region: RegionKey;
  onRegionChange: (r: RegionKey) => void;
  flightCount: number;
  onSettingsToggle: () => void;
  settingsOpen: boolean;
}

const REGIONS: { key: RegionKey; label: string }[] = [
  { key: 'usa', label: 'USA' },
  { key: 'europe', label: 'Europe' },
  { key: 'eastAsia', label: 'East Asia' },
  { key: 'world', label: 'Global' },
];

export const TopBar: React.FC<TopBarProps> = ({
  region,
  onRegionChange,
  flightCount,
  onSettingsToggle,
  settingsOpen,
}) => (
  <div style={styles.bar}>
    <div style={styles.logo}>
      <span style={styles.logoText}>orbit-lab</span>
      <span style={styles.logoSub}>flight tracker</span>
    </div>

    <div style={styles.regions}>
      {REGIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onRegionChange(key)}
          style={{ ...styles.regionBtn, ...(region === key ? styles.regionBtnActive : {}) }}
        >
          {label}
        </button>
      ))}
    </div>

    <div style={styles.right}>
      <span style={styles.liveGroup}>
        <span className="live-dot" />
        <span style={styles.count}>{flightCount.toLocaleString()} live</span>
      </span>
      <button
        onClick={onSettingsToggle}
        style={{ ...styles.gearBtn, ...(settingsOpen ? styles.gearBtnActive : {}) }}
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    background: 'var(--panel)',
    borderBottom: '1px solid var(--border)',
    zIndex: 20,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  logo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    minWidth: 140,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 300,
    letterSpacing: '0.15em',
    textTransform: 'lowercase',
    color: 'var(--text)',
  },
  logoSub: {
    fontSize: 10,
    color: 'var(--text-faint)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  regions: {
    display: 'flex',
    gap: 4,
  },
  regionBtn: {
    padding: '5px 14px',
    border: '1px solid var(--border-strong)',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 12,
    transition: 'all 0.2s',
  },
  regionBtnActive: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: 'var(--accent-contrast)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 140,
    justifyContent: 'flex-end',
  },
  liveGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  count: {
    fontSize: 11,
    color: 'var(--text-faint)',
    letterSpacing: '0.04em',
    fontVariantNumeric: 'tabular-nums',
  },
  gearBtn: {
    width: 32,
    height: 32,
    border: '1px solid var(--border-strong)',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--text)',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  gearBtnActive: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
  },
};

export default TopBar;
