'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useFlightData, useSettings } from '@/hooks/useFlightData';
import { useTrajectoryData } from '@/hooks/useTrajectoryData';
import { useFlightTrails } from '@/hooks/useFlightTrails';
import { useFlightRoutes } from '@/hooks/useFlightRoutes';
import { StatsPanel } from '@/components/panels/StatsPanel';
import { SettingsPanel } from '@/components/panels/SettingsPanel';
import { InfoPanel } from '@/components/panels/InfoPanel';
import { FlightList } from '@/components/panels/FlightList';
import { CornerDecor } from '@/components/hud/CornerDecor';
import { TopBar } from '@/components/hud/TopBar';
import type { FlightPoint } from '@/types/flight';
import type { RegionKey } from '@/lib/api/opensky';
import type { RegionType } from '@/lib/supabase/types';

const Globe = dynamic(() => import('@/components/Globe'), {
  ssr: false,
  loading: () => (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p>Loading globe...</p>
    </div>
  ),
});


export default function FlightsPage() {
  const [region, setRegion] = useState<RegionKey>('usa');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showPlanes, setShowPlanes] = useState(true);
  const [showAirports, setShowAirports] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightPoint | null>(null);

  const { settings } = useSettings();
  const refreshMs = settings.refresh_interval * 1000;

  const usaData = useFlightData({ region: 'usa', enabled: true, refreshInterval: refreshMs });
  const europeData = useFlightData({ region: 'europe', enabled: true, refreshInterval: refreshMs });
  const eastAsiaData = useFlightData({ region: 'eastAsia', enabled: true, refreshInterval: refreshMs });

  // International corridor fetches — only active in Global view
  const isGlobal = region === 'world';
  const atlanticData = useFlightData({ region: 'atlantic', enabled: isGlobal, refreshInterval: refreshMs });
  const pacificWestData = useFlightData({ region: 'pacificWest', enabled: isGlobal, refreshInterval: refreshMs });
  const pacificEastData = useFlightData({ region: 'pacificEast', enabled: isGlobal, refreshInterval: refreshMs });
  const euroAsiaData = useFlightData({ region: 'euroAsia', enabled: isGlobal, refreshInterval: refreshMs });

  // Global combines all 7 datasets: 3 regions + 4 oceanic corridors
  const globalFlights = useMemo(
    () => [
      ...usaData.flights, ...europeData.flights, ...eastAsiaData.flights,
      ...atlanticData.flights, ...pacificWestData.flights, ...pacificEastData.flights, ...euroAsiaData.flights,
    ],
    [usaData.flights, europeData.flights, eastAsiaData.flights, atlanticData.flights, pacificWestData.flights, pacificEastData.flights, euroAsiaData.flights]
  );

  const regionDataMap = {
    usa: usaData,
    europe: europeData,
    eastAsia: eastAsiaData,
    world: { flights: globalFlights, isLoading: usaData.isLoading || atlanticData.isLoading, lastUpdated: usaData.lastUpdated, refresh: usaData.refresh, error: null },
  };
  const { flights, isLoading, lastUpdated, refresh } = (regionDataMap as Record<string, typeof usaData>)[region] ?? usaData;

  const backgroundFlights = useMemo(() => {
    if (region === 'world') return [];
    return [
      ...(region !== 'usa' ? usaData.flights : []),
      ...(region !== 'europe' ? europeData.flights : []),
      ...(region !== 'eastAsia' ? eastAsiaData.flights : []),
    ];
  }, [region, usaData.flights, europeData.flights, eastAsiaData.flights]);

  const { trajectories } = useTrajectoryData(
    region !== 'world' ? (region as RegionType) : undefined,
    6
  );

  const { updateTrails } = useFlightTrails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const trails = useMemo(() => updateTrails(flights), [flights]);

  const callsigns = useMemo(
    () => [...new Set(flights.map((f) => f.callsign).filter((c): c is string => Boolean(c)))],
    [flights]
  );
  const flightRoutes = useFlightRoutes(callsigns);

  const handleFlightClick = useCallback((flight: FlightPoint) => {
    setSelectedFlight(flight);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div style={styles.container}>
      {dimensions.width > 0 && (
        <Globe
          flights={flights}
          trajectories={trajectories}
          trails={trails}
          width={dimensions.width}
          height={dimensions.height}
          region={region}
          showTrajectories={showTrajectories}
          showPlanes={showPlanes}
          showAirports={showAirports}
          showTrails={showTrails}
          onFlightClick={handleFlightClick}
          focusFlight={selectedFlight}
          flightRoutes={flightRoutes}
          backgroundFlights={backgroundFlights}
          autoRotate={autoRotate}
        />
      )}

      <TopBar
        region={region}
        onRegionChange={setRegion}
        flightCount={flights.length}
        onSettingsToggle={() => setShowSettings((v) => !v)}
        settingsOpen={showSettings}
      />

      <StatsPanel
        flights={flights}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <FlightList
        flights={flights}
        selectedFlight={selectedFlight}
        onSelect={handleFlightClick}
      />

      <InfoPanel
        flight={selectedFlight}
        onClose={() => setSelectedFlight(null)}
        bottomSheet={dimensions.width < 768}
      />

      {showSettings && (
        <SettingsPanel
          showPlanes={showPlanes}
          showAirports={showAirports}
          showTrails={showTrails}
          showTrajectories={showTrajectories}
          autoRotate={autoRotate}
          onTogglePlanes={() => setShowPlanes((v) => !v)}
          onToggleAirports={() => setShowAirports((v) => !v)}
          onToggleTrails={() => setShowTrails((v) => !v)}
          onToggleTrajectories={() => setShowTrajectories((v) => !v)}
          onToggleAutoRotate={() => setAutoRotate((v) => !v)}
        />
      )}

      <CornerDecor />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg)',
  },
  loading: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid var(--border-strong)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
