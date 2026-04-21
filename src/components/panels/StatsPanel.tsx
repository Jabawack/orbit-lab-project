'use client';

import React from 'react';
import type { FlightPoint } from '@/types/flight';

interface StatsPanelProps {
  flights: FlightPoint[];
  isLoading: boolean;
  lastUpdated: Date | null;
  onRefresh?: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  flights,
  isLoading,
  lastUpdated,
  onRefresh,
}) => {
  const airborne = flights.filter((f) => !f.onGround).length;
  const avgAltitude =
    flights.length > 0
      ? Math.round(flights.reduce((sum, f) => sum + f.alt, 0) / flights.length)
      : 0;

  // Count by country
  const byCountry = flights.reduce(
    (acc, f) => {
      acc[f.origin] = (acc[f.origin] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topCountries = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div style={styles.panel} className="panel-stats">
      <div style={styles.header}>
        <h3 style={styles.title}>Live Statistics</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={styles.refreshButton}
            disabled={isLoading}
          >
            {isLoading ? '...' : '↻'}
          </button>
        )}
      </div>

      <div style={styles.stats}>
        <StatBox label="Flights" value={flights.length.toLocaleString()} />
        <StatBox label="Airborne" value={airborne.toLocaleString()} />
        <StatBox
          label="Avg Altitude"
          value={`${Math.round(avgAltitude * 3.28084).toLocaleString()} ft`}
        />
      </div>

      {topCountries.length > 0 && (
        <div style={styles.countries}>
          <h4 style={styles.subtitle}>Top Countries</h4>
          {topCountries.map(([country, count]) => (
            <div key={country} style={styles.countryRow}>
              <span>{country}</span>
              <span style={styles.countryCount}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {lastUpdated && (
        <div style={styles.updated}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={styles.statBox}>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 220,
    backgroundColor: 'var(--panel)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--text)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
  },
  title: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  refreshButton: {
    background: 'none',
    border: '1px solid var(--border-strong)',
    borderRadius: 4,
    color: 'var(--text)',
    fontSize: 14,
    cursor: 'pointer',
    padding: '4px 8px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    padding: 12,
    gap: 8,
  },
  statBox: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--accent)',
  },
  statLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  countries: {
    padding: '8px 16px 12px',
    borderTop: '1px solid var(--border)',
  },
  subtitle: {
    margin: '0 0 8px 0',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  countryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    marginBottom: 4,
  },
  countryCount: {
    color: 'var(--text-muted)',
  },
  updated: {
    fontSize: 10,
    color: 'var(--text-faint)',
    textAlign: 'center',
    padding: '8px 16px',
    borderTop: '1px solid var(--border)',
  },
};

export default StatsPanel;
