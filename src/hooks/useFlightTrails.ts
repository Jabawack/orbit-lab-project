'use client';

import { useRef, useCallback } from 'react';
import type { FlightPoint } from '@/types/flight';

const MAX_TRAIL_POINTS = 20;
const MAX_TRAILS = 500;
const TRAIL_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface TrailPoint {
  lat: number;
  lng: number;
  alt: number;
  timestamp: number;
}

export interface FlightTrail {
  icao24: string;
  color: string;
  points: TrailPoint[];
}

// Deterministic color from icao24 string for consistent trail coloring
function icaoToColor(icao24: string): string {
  let hash = 0;
  for (let i = 0; i < icao24.length; i++) {
    hash = (hash * 31 + icao24.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 80%, 65%)`;
}

export function useFlightTrails() {
  // Map from icao24 → ring-buffer of trail points
  const trailsRef = useRef<Map<string, TrailPoint[]>>(new Map());
  const lastSeenRef = useRef<Map<string, number>>(new Map());

  const updateTrails = useCallback((flights: FlightPoint[]): FlightTrail[] => {
    const now = Date.now();
    const trails = trailsRef.current;
    const lastSeen = lastSeenRef.current;

    // Evict stale trails (plane disappeared for > TTL)
    for (const [icao24, ts] of lastSeen) {
      if (now - ts > TRAIL_TTL_MS) {
        trails.delete(icao24);
        lastSeen.delete(icao24);
      }
    }

    // Append new position for each active flight
    for (const flight of flights) {
      const { icao24, lat, lng, alt } = flight;
      lastSeen.set(icao24, now);

      const existing = trails.get(icao24);
      const newPoint: TrailPoint = { lat, lng, alt, timestamp: now };

      if (!existing) {
        trails.set(icao24, [newPoint]);
      } else {
        existing.push(newPoint);
        // Trim to ring-buffer size
        if (existing.length > MAX_TRAIL_POINTS) {
          existing.splice(0, existing.length - MAX_TRAIL_POINTS);
        }
      }
    }

    // Collect trails with ≥2 points; cap total to MAX_TRAILS
    const result: FlightTrail[] = [];
    for (const [icao24, points] of trails) {
      if (points.length < 2) continue;
      result.push({ icao24, color: icaoToColor(icao24), points });
      if (result.length >= MAX_TRAILS) break;
    }

    return result;
  }, []);

  const clearTrails = useCallback(() => {
    trailsRef.current.clear();
    lastSeenRef.current.clear();
  }, []);

  return { updateTrails, clearTrails };
}
