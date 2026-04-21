'use client';

import React, { useCallback } from 'react';
import { useSettings } from '@/hooks/useFlightData';
import { useTheme, type ThemeName } from '@/styles/theme';

interface SettingsPanelProps {
  onRefreshIntervalChange?: (seconds: number) => void;
  showPlanes?: boolean;
  showAirports?: boolean;
  showTrails?: boolean;
  showTrajectories?: boolean;
  autoRotate?: boolean;
  onTogglePlanes?: () => void;
  onToggleAirports?: () => void;
  onToggleTrails?: () => void;
  onToggleTrajectories?: () => void;
  onToggleAutoRotate?: () => void;
}

const REFRESH_OPTIONS = [
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: 'Off', value: 0 },
];

const RETENTION_OPTIONS = [
  { label: '1 day', value: 1 },
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

const THEME_OPTIONS: { label: string; value: ThemeName }[] = [
  { label: 'Cosmic', value: 'cosmic' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Topographic', value: 'topographic' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onRefreshIntervalChange,
  showPlanes = true,
  showAirports = true,
  showTrails = true,
  showTrajectories = true,
  autoRotate = false,
  onTogglePlanes,
  onToggleAirports,
  onToggleTrails,
  onToggleTrajectories,
  onToggleAutoRotate,
}) => {
  const { settings, updateRefreshInterval, updateRetentionDays } = useSettings();
  const { themeName, setTheme } = useTheme();

  const handleRefreshChange = useCallback(
    async (value: number) => {
      await updateRefreshInterval(value);
      onRefreshIntervalChange?.(value);
    },
    [updateRefreshInterval, onRefreshIntervalChange]
  );

  const handleRetentionChange = useCallback(
    async (value: number) => {
      await updateRetentionDays(value);
    },
    [updateRetentionDays]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>Settings</div>

      {/* Theme */}
      <div style={styles.section}>
        <div style={styles.label}>Theme</div>
        <div style={styles.buttonGroup}>
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              style={{
                ...styles.button,
                ...(themeName === option.value ? styles.buttonActive : {}),
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Refresh Interval */}
      <div style={styles.section}>
        <div style={styles.label}>Refresh Interval</div>
        <div style={styles.buttonGroup}>
          {REFRESH_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRefreshChange(option.value)}
              style={{
                ...styles.button,
                ...(settings.refresh_interval === option.value
                  ? styles.buttonActive
                  : {}),
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Retention */}
      <div style={styles.section}>
        <div style={styles.label}>Data Retention</div>
        <div style={styles.buttonGroup}>
          {RETENTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRetentionChange(option.value)}
              style={{
                ...styles.button,
                ...(settings.retention_days === option.value
                  ? styles.buttonActive
                  : {}),
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layers */}
      <div style={styles.section}>
        <div style={styles.label}>Layers</div>
        <div style={styles.buttonGroup}>
          {(
            [
              ['Planes', showPlanes, onTogglePlanes],
              ['Airports', showAirports, onToggleAirports],
              ['Trails', showTrails, onToggleTrails],
              ['Arcs', showTrajectories, onToggleTrajectories],
              ['Auto-rotate', autoRotate, onToggleAutoRotate],
            ] as [string, boolean, (() => void) | undefined][]
          ).map(([label, active, toggle]) => (
            <button
              key={label}
              onClick={toggle}
              style={{ ...styles.button, ...(active ? styles.buttonActive : {}) }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={styles.info}>
        Tracks flights in USA, Europe, and East Asia.
        Data saved to cloud for trajectory history.
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 56,
    right: 8,
    background: 'var(--panel)',
    padding: 16,
    borderRadius: 8,
    border: '1px solid var(--border)',
    zIndex: 10,
    minWidth: 200,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--text)',
  },
  header: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid var(--border)',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  buttonGroup: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
  },
  button: {
    padding: '6px 10px',
    fontSize: 12,
    border: '1px solid var(--border-strong)',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonActive: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: 'var(--accent-contrast)',
  },
  info: {
    fontSize: 10,
    color: 'var(--text-faint)',
    lineHeight: 1.5,
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--border)',
  },
};

export default SettingsPanel;
