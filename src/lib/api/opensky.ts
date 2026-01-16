/**
 * OpenSky Network API client
 * Documentation: https://openskynetwork.github.io/opensky-api/rest.html
 *
 * Free tier: 4,000 calls/day (~1 call every 22 seconds)
 */

import type { OpenSkyResponse, FlightStateArray } from '@/types/flight';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';

export interface BoundingBox {
  lamin: number; // minimum latitude
  lamax: number; // maximum latitude
  lomin: number; // minimum longitude
  lomax: number; // maximum longitude
}

/**
 * Fetch all flight states within a bounding box
 */
export async function fetchFlightStates(
  bounds?: BoundingBox
): Promise<FlightStateArray[]> {
  const url = new URL(`${OPENSKY_BASE_URL}/states/all`);

  if (bounds) {
    url.searchParams.set('lamin', bounds.lamin.toString());
    url.searchParams.set('lamax', bounds.lamax.toString());
    url.searchParams.set('lomin', bounds.lomin.toString());
    url.searchParams.set('lomax', bounds.lomax.toString());
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 10 }, // Cache for 10 seconds
  });

  if (!response.ok) {
    throw new Error(`OpenSky API error: ${response.status}`);
  }

  const data: OpenSkyResponse = await response.json();
  return data.states ?? [];
}

/**
 * Predefined bounding boxes for common regions
 */
export const REGIONS = {
  // Continental US
  usa: {
    lamin: 24.396308,
    lamax: 49.384358,
    lomin: -125.0,
    lomax: -66.93457,
  },
  // Europe
  europe: {
    lamin: 35.0,
    lamax: 72.0,
    lomin: -25.0,
    lomax: 45.0,
  },
  // East Asia
  eastAsia: {
    lamin: 20.0,
    lamax: 50.0,
    lomin: 100.0,
    lomax: 150.0,
  },
  // World (no bounds - all flights)
  world: undefined,
} as const;

export type RegionKey = keyof typeof REGIONS;
