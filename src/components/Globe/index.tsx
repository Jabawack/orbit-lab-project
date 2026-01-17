'use client';

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import type { FlightPoint } from '@/types/flight';
import type { FlightTrajectory } from '@/hooks/useTrajectoryData';
import { getAltitudeColor } from '@/lib/utils/coordinates';

interface OrbitGlobeProps {
  flights?: FlightPoint[];
  trajectories?: FlightTrajectory[];
  width?: number;
  height?: number;
  region?: string;
  showTrajectories?: boolean;
}

// Region center coordinates (lower altitude = more zoomed in)
const REGION_CENTERS: Record<string, { lat: number; lng: number; altitude: number }> = {
  usa: { lat: 39.8, lng: -98.5, altitude: 0.9 },
  europe: { lat: 50, lng: 10, altitude: 0.7 },
  eastAsia: { lat: 35, lng: 120, altitude: 0.9 },
};

export const OrbitGlobe: React.FC<OrbitGlobeProps> = ({
  flights = [],
  trajectories = [],
  width,
  height,
  region = 'usa',
  showTrajectories = true,
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [altitude, setAltitude] = useState(0.9);

  // Set initial camera position
  useEffect(() => {
    if (globeRef.current) {
      const center = REGION_CENTERS[region] || REGION_CENTERS.usa;
      globeRef.current.pointOfView(center, 0);
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  // Refocus when region changes
  useEffect(() => {
    if (globeRef.current) {
      const center = REGION_CENTERS[region] || REGION_CENTERS.usa;
      setAltitude(center.altitude);
      globeRef.current.pointOfView(center, 1000); // 1 second animation
    }
  }, [region]);

  // Zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!globeRef.current) return;

    const currentPov = globeRef.current.pointOfView();
    const newAlt = direction === 'in'
      ? Math.max(0.3, currentPov.altitude * 0.7)
      : Math.min(3, currentPov.altitude * 1.4);

    setAltitude(newAlt);
    globeRef.current.pointOfView({ ...currentPov, altitude: newAlt }, 300);
  }, []);

  // Reset view to current region's default position
  const handleReset = useCallback(() => {
    if (!globeRef.current) return;
    const center = REGION_CENTERS[region] || REGION_CENTERS.usa;
    setAltitude(center.altitude);
    globeRef.current.pointOfView(center, 500);
  }, [region]);

  // Limit flights for performance (6000+ HTML elements kills the browser)
  const MAX_DISPLAY_FLIGHTS = 500;

  // Transform flights to points data - flat dots colored by altitude
  const pointsData = useMemo(() => {
    // Sort by altitude (show higher flights) and limit
    const sorted = [...flights].sort((a, b) => b.alt - a.alt);
    const limited = sorted.slice(0, MAX_DISPLAY_FLIGHTS);

    return limited.map((flight) => ({
      lat: flight.lat,
      lng: flight.lng,
      color: getAltitudeColor(flight.alt),
      label: flight.callsign,
      flight,
    }));
  }, [flights]);

  // Transform trajectories to arcs data
  const arcsData = useMemo(() => {
    if (!showTrajectories || trajectories.length === 0) return [];

    return trajectories.map((traj) => ({
      startLat: traj.startLat,
      startLng: traj.startLng,
      endLat: traj.endLat,
      endLng: traj.endLng,
      color: traj.color,
      icao24: traj.icao24,
      callsign: traj.callsign,
    }));
  }, [trajectories, showTrajectories]);

  // Custom point label on hover
  const getPointLabel = useCallback(
    (d: object) => {
      const point = d as (typeof pointsData)[0];
      return `
        <div style="
          background: rgba(0,0,0,0.85);
          padding: 8px 12px;
          border-radius: 4px;
          font-family: system-ui;
          font-size: 12px;
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
        ">
          <strong style="color: #3b82f6;">${point.label}</strong><br/>
          Alt: ${Math.round(point.flight.alt * 3.28084).toLocaleString()} ft<br/>
          Speed: ${Math.round(point.flight.velocity * 1.94384)} kts<br/>
          Heading: ${Math.round(point.flight.heading)}°
        </div>
      `;
    },
    []
  );

  // Create HTML element for each flight (airplane icon with rotation)
  const getHtmlElement = useCallback((d: object) => {
    const point = d as (typeof pointsData)[0];
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="
        transform: rotate(${point.flight.heading}deg);
        font-size: 14px;
        cursor: pointer;
        filter: drop-shadow(0 0 2px rgba(0,0,0,0.8));
      ">✈️</div>
    `;
    el.style.color = point.color;
    el.style.pointerEvents = 'auto';
    return el;
  }, []);

  return (
    <>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        showAtmosphere={true}
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.2}
        // Flight icons using HTML elements
        htmlElementsData={pointsData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.01}
        htmlElement={getHtmlElement}
        // Keep point labels for hover
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0}
        pointColor={() => 'rgba(0,0,0,0)'}
        pointRadius={0.3}
        pointLabel={getPointLabel}
        // Trajectory arcs
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.02}
        arcStroke={0.5}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        enablePointerInteraction={true}
      />

      {/* Zoom Controls */}
      <div style={styles.zoomControls}>
        <button onClick={() => handleZoom('in')} style={styles.zoomButton}>+</button>
        <button onClick={handleReset} style={styles.zoomButton}>⟲</button>
        <button onClick={() => handleZoom('out')} style={styles.zoomButton}>−</button>
      </div>

      {/* Altitude Legend - placeholder for future state times */}
      <div style={styles.legend}>
        <div style={styles.legendTitle}>Altitude</div>
        <div style={styles.legendGradient} />
        <div style={styles.legendLabels}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Trajectory info */}
      {showTrajectories && trajectories.length > 0 && (
        <div style={styles.trajectoryInfo}>
          <span>{trajectories.length} flight trajectories</span>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    zIndex: 10,
  },
  zoomButton: {
    width: 40,
    height: 40,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui',
  },
  legend: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '8px 12px',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  legendTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 4,
  },
  legendGradient: {
    width: 80,
    height: 8,
    background: 'linear-gradient(to right, hsl(240, 80%, 50%), hsl(120, 80%, 50%), hsl(60, 80%, 50%), hsl(0, 80%, 50%))',
    borderRadius: 2,
  },
  legendLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  trajectoryInfo: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'system-ui',
    zIndex: 10,
  },
};

export default OrbitGlobe;
