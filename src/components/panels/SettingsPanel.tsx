'use client';

import React, { useCallback } from 'react';
import { useSettings } from '@/hooks/useFlightData';

interface SettingsPanelProps {
  onRefreshIntervalChange?: (seconds: number) => void;
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

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onRefreshIntervalChange,
}) => {
  const { settings, updateRefreshInterval, updateRetentionDays } = useSettings();

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
    top: 20,
    right: 80,
    background: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
    minWidth: 200,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
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
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonActive: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff',
  },
  info: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 1.5,
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

export default SettingsPanel;
