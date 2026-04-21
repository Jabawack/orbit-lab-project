'use client';

import { useCallback, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { type BoundingBox, type RegionKey, REGIONS } from '@/lib/api/opensky';
import { parseFlightState, toFlightPoint, type FlightPoint, type FlightStateArray } from '@/types/flight';
import { saveFlightPositions, getSettings } from '@/lib/supabase/flights';
import type { Settings, RegionType } from '@/lib/supabase/types';

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds default

interface UseFlightDataOptions {
  region?: RegionKey;
  bounds?: BoundingBox;
  enabled?: boolean;
  refreshInterval?: number; // Override refresh interval in milliseconds
}

interface UseFlightDataReturn {
  flights: FlightPoint[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useFlightData(options: UseFlightDataOptions = {}): UseFlightDataReturn {
  const { region = 'usa', bounds, enabled = true, refreshInterval } = options;
  const lastSaveRef = useRef<number>(0);

  // Determine refresh interval
  const effectiveInterval = refreshInterval ?? DEFAULT_REFRESH_INTERVAL;

  const { data, error, isLoading, mutate } = useSWR(
    enabled ? ['flights', region, JSON.stringify(bounds ?? null)] : null,
    async () => {
      // Call our server-side proxy — browser-direct OpenSky is CORS-blocked
      const res = await fetch(`/api/flights?region=${encodeURIComponent(region)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Flights API returned ${res.status}`);
      }
      const { states } = (await res.json()) as { states: FlightStateArray[] };
      const flights = states
        .map(parseFlightState)
        .map(toFlightPoint)
        .filter((p): p is FlightPoint => p !== null && !p.onGround);

      // Save to Supabase (throttled to avoid too many writes)
      // Only save if region is one of the tracked regions (not 'world')
      const TRACKED_REGIONS = new Set(['usa', 'europe', 'eastAsia']);
      const now = Date.now();
      if (now - lastSaveRef.current >= 30000 && TRACKED_REGIONS.has(region)) {
        lastSaveRef.current = now;
        // Fire and forget - don't block the UI
        saveFlightPositions(flights, region as RegionType, 'client').catch((err) => {
          console.warn('Failed to save flight positions:', err);
        });
      }

      return flights;
    },
    {
      refreshInterval: effectiveInterval > 0 ? effectiveInterval : undefined,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    flights: data ?? [],
    isLoading,
    error: error ?? null,
    lastUpdated: data ? new Date() : null,
    refresh: () => mutate(),
  };
}

/**
 * Hook to manage app settings including refresh interval
 */
export function useSettings() {
  const { data, error, mutate } = useSWR<Settings>(
    'app-settings',
    async () => {
      return await getSettings();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Only refetch settings every minute
    }
  );

  const updateRefreshInterval = useCallback(
    async (seconds: number) => {
      const { updateSetting } = await import('@/lib/supabase/flights');
      await updateSetting('refresh_interval', seconds.toString());
      mutate({ ...data!, refresh_interval: seconds });
    },
    [data, mutate]
  );

  const updateRetentionDays = useCallback(
    async (days: number) => {
      const { updateSetting } = await import('@/lib/supabase/flights');
      await updateSetting('retention_days', days.toString());
      mutate({ ...data!, retention_days: days });
    },
    [data, mutate]
  );

  return {
    settings: data ?? { refresh_interval: 30, retention_days: 14, client_tracking: true },
    isLoading: !data && !error,
    error,
    updateRefreshInterval,
    updateRetentionDays,
  };
}
