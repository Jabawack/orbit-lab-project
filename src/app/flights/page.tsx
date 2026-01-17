'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFlightData, useSettings } from '@/hooks/useFlightData';
import { useTrajectoryData } from '@/hooks/useTrajectoryData';
import { StatsPanel } from '@/components/panels/StatsPanel';
import { SettingsPanel } from '@/components/panels/SettingsPanel';
import type { RegionKey } from '@/lib/api/opensky';
import type { RegionType } from '@/lib/supabase/types';

// Dynamic import with SSR disabled for Three.js components
const Globe = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p>Loading globe...</p>
    </div>
  ),
});

const REGIONS: { key: RegionKey; label: string }[] = [
  { key: 'usa', label: 'United States' },
  { key: 'europe', label: 'Europe' },
  { key: 'eastAsia', label: 'East Asia' },
];

export default function FlightsPage() {
  const [region, setRegion] = useState<RegionKey>('usa');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showTrajectories, setShowTrajectories] = useState(true);

  const { settings } = useSettings();

  const { flights, isLoading, lastUpdated, refresh } = useFlightData({
    region,
    enabled: true,
    refreshInterval: settings.refresh_interval * 1000, // Convert to ms
  });

  // Get trajectory data for the current region
  const { trajectories } = useTrajectoryData(
    region !== 'world' ? (region as RegionType) : undefined,
    6 // 6 hours of history
  );

  // Get window dimensions for globe sizing
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div style={styles.container}>
      {/* Globe */}
      {dimensions.width > 0 && (
        <Globe
          flights={flights}
          trajectories={trajectories}
          width={dimensions.width}
          height={dimensions.height}
          region={region}
          showTrajectories={showTrajectories}
        />
      )}

      {/* Region selector */}
      <div style={styles.regionSelector}>
        {REGIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRegion(key)}
            style={{
              ...styles.regionButton,
              ...(region === key ? styles.regionButtonActive : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats Panel */}
      <StatsPanel
        flights={flights}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        style={styles.settingsToggle}
        title="Settings"
      >
        ⚙️
      </button>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel />}

      {/* Title overlay */}
      <div style={styles.title}>
        <h1 style={styles.titleText}>orbit-lab-project</h1>
        <p style={styles.subtitle}>Real-time Flight Tracker</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#000',
  },
  loading: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255, 255, 255, 0.2)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  regionSelector: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  regionButton: {
    padding: '8px 16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 13,
    transition: 'all 0.2s',
  },
  regionButtonActive: {
    background: '#3b82f6',
    border: '1px solid #3b82f6',
  },
  settingsToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 10,
  },
  titleText: {
    margin: 0,
    fontSize: 24,
    fontWeight: 300,
    letterSpacing: '0.2em',
    textTransform: 'lowercase',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 12,
    opacity: 0.6,
    letterSpacing: '0.1em',
  },
};
