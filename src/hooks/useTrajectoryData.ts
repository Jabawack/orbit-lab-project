'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { getRecentPositions, getFlightHistory } from '@/lib/supabase/flights';
import type { FlightPosition, RegionType } from '@/lib/supabase/types';

interface TrajectoryPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface FlightTrajectory {
  icao24: string;
  callsign: string | null;
  points: TrajectoryPoint[];
  // For arc rendering
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

/**
 * Get all flight trajectories for a region from historical data
 */
export function useTrajectoryData(region?: RegionType, hoursBack: number = 6) {
  const { data: positions, error, isLoading } = useSWR(
    ['trajectories', region, hoursBack],
    async () => {
      return await getRecentPositions(region, hoursBack);
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    }
  );

  // Group positions by aircraft and build trajectories
  const trajectories = useMemo(() => {
    if (!positions || positions.length === 0) return [];

    // Group by icao24
    const grouped = new Map<string, FlightPosition[]>();
    for (const pos of positions) {
      const existing = grouped.get(pos.icao24) || [];
      existing.push(pos);
      grouped.set(pos.icao24, existing);
    }

    // Convert to trajectories
    const result: FlightTrajectory[] = [];
    for (const [icao24, flightPositions] of grouped) {
      // Sort by time
      flightPositions.sort(
        (a, b) =>
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );

      // Need at least 2 points for a trajectory
      if (flightPositions.length < 2) continue;

      const points = flightPositions.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        timestamp: new Date(p.recorded_at).getTime(),
      }));

      const first = points[0];
      const last = points[points.length - 1];

      result.push({
        icao24,
        callsign: flightPositions[0].callsign,
        points,
        startLat: first.lat,
        startLng: first.lng,
        endLat: last.lat,
        endLng: last.lng,
        color: getTrajectoryColor(icao24),
      });
    }

    return result;
  }, [positions]);

  return {
    trajectories,
    isLoading,
    error,
    totalPositions: positions?.length || 0,
  };
}

/**
 * Get trajectory for a single aircraft
 */
export function useSingleFlightTrajectory(icao24: string | null, hoursBack: number = 24) {
  const { data: positions, error, isLoading } = useSWR(
    icao24 ? ['trajectory', icao24, hoursBack] : null,
    async () => {
      if (!icao24) return [];
      return await getFlightHistory(icao24, hoursBack);
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  const trajectory = useMemo(() => {
    if (!positions || positions.length < 2 || !icao24) return null;

    const points = positions.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      timestamp: new Date(p.recorded_at).getTime(),
    }));

    const first = points[0];
    const last = points[points.length - 1];

    return {
      icao24,
      callsign: positions[0].callsign,
      points,
      startLat: first.lat,
      startLng: first.lng,
      endLat: last.lat,
      endLng: last.lng,
      color: '#3b82f6',
    };
  }, [positions, icao24]);

  return {
    trajectory,
    isLoading,
    error,
  };
}

/**
 * Generate consistent color for each aircraft
 */
function getTrajectoryColor(icao24: string): string {
  // Simple hash to generate hue
  let hash = 0;
  for (let i = 0; i < icao24.length; i++) {
    hash = icao24.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Interpolate trajectory to estimate current position
 * Based on last known velocity and heading
 */
export function interpolatePosition(
  trajectory: FlightTrajectory,
  currentTime: number
): { lat: number; lng: number } | null {
  if (trajectory.points.length === 0) return null;

  const lastPoint = trajectory.points[trajectory.points.length - 1];
  const timeDiff = (currentTime - lastPoint.timestamp) / 1000; // seconds

  // If last data point is more than 10 minutes old, don't interpolate
  if (timeDiff > 600) return null;

  // For now, return last known position
  // In a more advanced implementation, we'd use heading/velocity to extrapolate
  return {
    lat: lastPoint.lat,
    lng: lastPoint.lng,
  };
}
