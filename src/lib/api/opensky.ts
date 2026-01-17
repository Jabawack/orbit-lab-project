/**
 * OpenSky Network API client with OAuth2 authentication
 * Documentation: https://openskynetwork.github.io/opensky-api/rest.html
 *
 * Rate limits:
 * - Anonymous: 400 credits/day
 * - Authenticated: 4,000 credits/day
 * - Active contributors (30%+ uptime): 8,000 credits/day
 */

import type { OpenSkyResponse, FlightStateArray } from '@/types/flight';
import { parseFlightState, toFlightPoint, type FlightPoint } from '@/types/flight';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';
const OPENSKY_AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

export interface BoundingBox {
  lamin: number;
  lamax: number;
  lomin: number;
  lomax: number;
}

export interface RateLimitInfo {
  remaining: number | null;
  retryAfterSeconds: number | null;
  lastUpdated: number;
  authenticated: boolean;
}

// Token cache (server-side only)
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

// Rate limit tracking
let rateLimitInfo: RateLimitInfo = {
  remaining: null,
  retryAfterSeconds: null,
  lastUpdated: 0,
  authenticated: false,
};

/**
 * Get OAuth2 access token using client credentials flow
 */
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  try {
    const response = await fetch(OPENSKY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      console.error('OpenSky OAuth2 token error:', response.status);
      return null;
    }

    const data = await response.json();

    // Cache token (expires_in is in seconds, typically 1800 = 30 min)
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    return cachedToken.accessToken;
  } catch (error) {
    console.error('OpenSky OAuth2 error:', error);
    return null;
  }
}

/**
 * Update rate limit info from response headers
 */
function updateRateLimitFromResponse(response: Response, authenticated: boolean): void {
  const remaining = response.headers.get('X-Rate-Limit-Remaining');
  const retryAfter = response.headers.get('X-Rate-Limit-Retry-After-Seconds');

  rateLimitInfo = {
    remaining: remaining ? parseInt(remaining, 10) : rateLimitInfo.remaining,
    retryAfterSeconds: retryAfter ? parseInt(retryAfter, 10) : null,
    lastUpdated: Date.now(),
    authenticated,
  };
}

/**
 * Get current rate limit info
 */
export function getRateLimitInfo(): RateLimitInfo {
  return { ...rateLimitInfo };
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

  // Get OAuth2 token
  const token = await getAccessToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    next: { revalidate: 10 },
  });

  // Update rate limit tracking
  updateRateLimitFromResponse(response, !!token);

  if (response.status === 429) {
    throw new Error('OpenSky API rate limit exceeded');
  }

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
  usa: {
    lamin: 24.396308,
    lamax: 49.384358,
    lomin: -125.0,
    lomax: -66.93457,
  },
  europe: {
    lamin: 35.0,
    lamax: 72.0,
    lomin: -25.0,
    lomax: 45.0,
  },
  eastAsia: {
    lamin: 20.0,
    lamax: 50.0,
    lomin: 100.0,
    lomax: 150.0,
  },
  world: undefined,
} as const;

export type RegionKey = keyof typeof REGIONS;

/**
 * Fetch flights for a specific region
 */
export async function fetchFlights(region: RegionKey): Promise<FlightPoint[]> {
  const bounds = REGIONS[region];
  const states = await fetchFlightStates(bounds);

  return states
    .map(parseFlightState)
    .map(toFlightPoint)
    .filter((p): p is FlightPoint => p !== null && !p.onGround);
}
