'use client';

import useSWR from 'swr';
import { fetchFlightStates, type BoundingBox, type RegionKey, REGIONS } from '@/lib/api/opensky';
import { parseFlightState, toFlightPoint, type FlightPoint } from '@/types/flight';

const REFRESH_INTERVAL = 15000; // 15 seconds (stay within free tier limits)

interface UseFlightDataOptions {
  region?: RegionKey;
  bounds?: BoundingBox;
  enabled?: boolean;
}

interface UseFlightDataReturn {
  flights: FlightPoint[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useFlightData(options: UseFlightDataOptions = {}): UseFlightDataReturn {
  const { region = 'usa', bounds, enabled = true } = options;

  // Use custom bounds or predefined region
  const effectiveBounds = bounds ?? REGIONS[region];

  const { data, error, isLoading, mutate } = useSWR(
    enabled ? ['flights', JSON.stringify(effectiveBounds)] : null,
    async () => {
      const states = await fetchFlightStates(effectiveBounds);
      return states
        .map(parseFlightState)
        .map(toFlightPoint)
        .filter((p): p is FlightPoint => p !== null && !p.onGround);
    },
    {
      refreshInterval: REFRESH_INTERVAL,
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
