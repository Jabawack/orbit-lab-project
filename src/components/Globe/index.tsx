'use client';

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import type { FlightPoint } from '@/types/flight';
import type { FlightTrajectory } from '@/hooks/useTrajectoryData';
import type { FlightTrail } from '@/hooks/useFlightTrails';
import { getAltitudeColor, haversineDistance, bearingBetween } from '@/lib/utils/coordinates';
import { airports, type Airport } from '@/data/airports';
import { useTheme } from '@/styles/theme';
import { styles } from './styles';

interface OrbitGlobeProps {
  flights?: FlightPoint[];
  trajectories?: FlightTrajectory[];
  trails?: FlightTrail[];
  width?: number;
  height?: number;
  region?: string;
  showTrajectories?: boolean;
  showPlanes?: boolean;
  showAirports?: boolean;
  showTrails?: boolean;
  onFlightClick?: (flight: FlightPoint) => void;
  focusFlight?: FlightPoint | null;
  flightRoutes?: Map<string, { originIcao: string; destIcao: string }>;
  backgroundFlights?: FlightPoint[];
  autoRotate?: boolean;
}

// Stable empty array — avoids new array references each render when a layer is hidden
const EMPTY: never[] = [];

interface ArcDatum {
  startLat: number; startLng: number;
  endLat: number; endLng: number;
  color: string; icao24: string;
}

function inferArcs(flightList: FlightPoint[], maxArcs: number, colorFn: (alt: number) => string): ArcDatum[] {
  const cruising = flightList
    .filter((f) => !f.onGround && f.alt > 6000)
    .sort((a, b) => b.alt - a.alt)
    .slice(0, Math.ceil(maxArcs * 2));
  const seen = new Set<string>();
  const result: ArcDatum[] = [];

  for (const flight of cruising) {
    if (result.length >= maxArcs) break;
    let bestDest: Airport | null = null;
    let bestDestDist = Infinity;
    let bestOrigin: Airport | null = null;
    let bestOriginDist = Infinity;

    for (const airport of airports) {
      const dist = haversineDistance(flight.lat, flight.lng, airport.lat, airport.lng);
      if (dist < 80 || dist > 6000) continue;
      const bearing = bearingBetween(flight.lat, flight.lng, airport.lat, airport.lng);
      const diff = (bearing - flight.heading + 360) % 360;
      if ((diff < 30 || diff > 330) && dist < bestDestDist) { bestDest = airport; bestDestDist = dist; }
      if (diff > 150 && diff < 210 && dist < bestOriginDist) { bestOrigin = airport; bestOriginDist = dist; }
    }

    if (bestDest && bestOrigin && bestDest.icao !== bestOrigin.icao) {
      const key = `${bestOrigin.icao}→${bestDest.icao}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ startLat: bestOrigin.lat, startLng: bestOrigin.lng, endLat: bestDest.lat, endLng: bestDest.lng, color: colorFn(flight.alt), icao24: flight.id });
      }
    }
  }
  return result;
}

const REGION_CENTERS: Record<string, { lat: number; lng: number; altitude: number }> = {
  usa: { lat: 39.8, lng: -98.5, altitude: 0.9 },
  europe: { lat: 50, lng: 10, altitude: 0.7 },
  eastAsia: { lat: 35, lng: 120, altitude: 0.9 },
  world: { lat: 20, lng: 0, altitude: 2.5 },
};

export const OrbitGlobe: React.FC<OrbitGlobeProps> = ({
  flights = [],
  trajectories = [],
  trails = [],
  width,
  height,
  region = 'usa',
  showTrajectories = true,
  showPlanes = true,
  showAirports = true,
  showTrails = true,
  onFlightClick,
  focusFlight,
  flightRoutes,
  backgroundFlights = [],
  autoRotate = false,
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [altitude, setAltitude] = useState(0.9);
  const { theme } = useTheme();

  useEffect(() => {
    if (globeRef.current) {
      const center = REGION_CENTERS[region] || REGION_CENTERS.usa;
      globeRef.current.pointOfView(center, 0);
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const center = REGION_CENTERS[region] || REGION_CENTERS.usa;
      setAltitude(center.altitude);
      globeRef.current.pointOfView(center, 1000);
    }
  }, [region]);

  useEffect(() => {
    if (focusFlight && globeRef.current) {
      globeRef.current.pointOfView({ lat: focusFlight.lat, lng: focusFlight.lng, altitude: 0.9 }, 1500);
    }
  }, [focusFlight]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.4;
  }, [autoRotate]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    let pendingRaf: number;
    const onControlsChange = () => {
      cancelAnimationFrame(pendingRaf);
      pendingRaf = requestAnimationFrame(() => {
        const pov = globeRef.current?.pointOfView();
        if (pov?.altitude != null) setAltitude(pov.altitude);
      });
    };
    controls.addEventListener('change', onControlsChange);
    return () => {
      controls.removeEventListener('change', onControlsChange);
      cancelAnimationFrame(pendingRaf);
    };
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!globeRef.current) return;
    const currentPov = globeRef.current.pointOfView();
    const newAlt = direction === 'in'
      ? Math.max(0.3, currentPov.altitude * 0.7)
      : Math.min(3, currentPov.altitude * 1.4);
    setAltitude(newAlt);
    globeRef.current.pointOfView({ ...currentPov, altitude: newAlt }, 300);
  }, []);

  const handleReset = useCallback(() => {
    if (!globeRef.current) return;
    const center = REGION_CENTERS[region] || REGION_CENTERS.usa;
    setAltitude(center.altitude);
    globeRef.current.pointOfView(center, 500);
  }, [region]);

  const handleObjectClick = useCallback((obj: object) => {
    const point = obj as { flight?: FlightPoint };
    if (point.flight && onFlightClick) onFlightClick(point.flight);
  }, [onFlightClick]);

  const MAX_DISPLAY_FLIGHTS = 500;

  const coneGeom = useMemo(() => new THREE.ConeGeometry(0.6, 2.2, 8), []);

  const globeMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: theme.globeBase }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useEffect(() => {
    globeMaterial.color.set(theme.globeBase);
  }, [globeMaterial, theme.globeBase]);

  const [countries, setCountries] = useState<{ features: object[] } | null>(null);
  useEffect(() => {
    fetch('/geo/world-country-borders.geojson')
      .then((r) => r.json())
      .then(setCountries)
      .catch((err) => console.warn('Failed to load countries geojson:', err));
  }, []);

  const objectsData = useMemo(() => {
    const active = [...flights]
      .sort((a, b) => b.alt - a.alt)
      .slice(0, MAX_DISPLAY_FLIGHTS)
      .map((flight) => ({ lat: flight.lat, lng: flight.lng, color: getAltitudeColor(flight.alt), label: flight.callsign, flight }));
    const bg = backgroundFlights
      .slice(0, MAX_DISPLAY_FLIGHTS)
      .map((flight) => ({ lat: flight.lat, lng: flight.lng, color: 'rgba(160,160,160,0.3)', label: flight.callsign, flight }));
    return [...bg, ...active];
  }, [flights, backgroundFlights]);

  // Always show all airports — they serve as global reference points across all regions
  const airportPoints = airports;

  const airportByIcao = useMemo(() => new Map(airports.map((a) => [a.icao, a])), []);

  const getAirportLabel = useCallback((d: object) => {
    const a = d as Airport;
    return `
      <div style="background:rgba(0,0,0,0.85);padding:6px 10px;border-radius:4px;font-family:system-ui;font-size:11px;color:white;border:1px solid rgba(255,255,255,0.1)">
        <strong>${a.iata}</strong> · ${a.name}<br/>
        <span style="color:rgba(255,255,255,0.5)">${a.city}, ${a.country}</span>
      </div>`;
  }, []);

  const arcsData = useMemo(() => {
    if (!showTrajectories) return [];

    // Use Supabase trajectory arcs when available (with optional OpenSky route resolution)
    if (trajectories.length > 0) {
      return trajectories.flatMap((traj) => {
        const route = flightRoutes?.get(traj.callsign ?? '');
        if (route) {
          const o = airportByIcao.get(route.originIcao);
          const d = airportByIcao.get(route.destIcao);
          if (o && d) {
            return [{ startLat: o.lat, startLng: o.lng, endLat: d.lat, endLng: d.lng, color: traj.color, icao24: traj.icao24, callsign: traj.callsign }];
          }
        }
        return [{ startLat: traj.startLat, startLng: traj.startLng, endLat: traj.endLat, endLng: traj.endLng, color: traj.color, icao24: traj.icao24, callsign: traj.callsign }];
      });
    }

    // Infer arcs from live flights — active region in full color, background regions in gray
    const activeArcs = inferArcs(flights, 30, getAltitudeColor);
    const bgArcs = inferArcs(backgroundFlights, 20, () => 'rgba(120,120,120,0.2)');
    return [...bgArcs, ...activeArcs];
  }, [trajectories, showTrajectories, flightRoutes, airportByIcao, flights, backgroundFlights]);

  const pathsData = useMemo(() => {
    if (trails.length === 0) return [];
    return trails.map((trail) => ({
      coords: trail.points.map((p) => [p.lat, p.lng]),
      color: trail.color,
      icao24: trail.icao24,
    }));
  }, [trails]);

  const getObjectLabel = useCallback((d: object) => {
    const point = d as (typeof objectsData)[0];
    return `
      <div style="background:rgba(0,0,0,0.85);padding:8px 12px;border-radius:4px;font-family:system-ui;font-size:12px;color:white;border:1px solid rgba(255,255,255,0.1)">
        <strong style="color:#3b82f6">${point.label}</strong><br/>
        Alt: ${Math.round(point.flight.alt * 3.28084).toLocaleString()} ft<br/>
        Speed: ${Math.round(point.flight.velocity * 1.94384)} kts<br/>
        Heading: ${Math.round(point.flight.heading)}°
      </div>`;
  }, []);

  const buildObjectMesh = useCallback(
    (d: object) => {
      const point = d as (typeof objectsData)[0];
      const mat = new THREE.MeshBasicMaterial({ color: point.color });
      const mesh = new THREE.Mesh(coneGeom, mat);
      mesh.rotation.x = Math.PI / 2;
      mesh.rotation.y = -(point.flight.heading * Math.PI) / 180;
      const scale = Math.min(2.5, Math.max(0.5, altitude * 1.1));
      mesh.scale.set(scale, scale, scale);
      return mesh;
    },
    [coneGeom, altitude]
  );

  return (
    <>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeMaterial={globeMaterial}
        backgroundImageUrl={theme.backgroundImage ?? undefined}
        backgroundColor={theme.backgroundImage ? undefined : theme.bg}
        showAtmosphere={true}
        atmosphereColor={theme.atmosphere}
        atmosphereAltitude={0.2}
        polygonsData={countries?.features ?? []}
        polygonCapColor={() => theme.polygonCap}
        polygonSideColor={() => theme.polygonSide}
        polygonStrokeColor={() => theme.polygonStroke}
        polygonAltitude={0.005}
        objectsData={showPlanes ? objectsData : EMPTY}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0.02}
        objectThreeObject={buildObjectMesh}
        objectLabel={getObjectLabel}
        onObjectClick={handleObjectClick}
        pointsData={showAirports ? airportPoints : EMPTY}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.008}
        pointRadius={Math.min(0.6, Math.max(0.25, altitude * 0.44))}
        pointColor={() => 'rgba(255, 255, 255, 0.8)'}
        pointLabel={getAirportLabel}
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.15}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={0.3}
        arcDashAnimateTime={3000}
        pathsData={showTrails ? pathsData : EMPTY}
        pathPoints="coords"
        pathPointLat={(p: object) => (p as number[])[0]}
        pathPointLng={(p: object) => (p as number[])[1]}
        pathPointAlt={0.012}
        pathColor="color"
        pathStroke={1.5}
        pathDashLength={0.6}
        pathDashGap={0.2}
        pathDashAnimateTime={4000}
        enablePointerInteraction={true}
      />

      <div style={styles.zoomControls}>
        <button onClick={() => handleZoom('in')} style={styles.zoomButton}>+</button>
        <button onClick={handleReset} style={styles.zoomButton}>⟲</button>
        <button onClick={() => handleZoom('out')} style={styles.zoomButton}>−</button>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendTitle}>Altitude</div>
        <div style={styles.legendGradient} />
        <div style={styles.legendLabels}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {showTrajectories && trajectories.length > 0 && (
        <div style={styles.trajectoryInfo}>
          <span>{trajectories.length} flight trajectories</span>
        </div>
      )}
    </>
  );
};

export default OrbitGlobe;
