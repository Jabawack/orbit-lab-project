/**
 * Geographic coordinate utilities
 */

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Convert knots to km/h
 */
export function knotsToKmh(knots: number): number {
  return knots * 1.852;
}

/**
 * Convert m/s to knots
 */
export function msToKnots(ms: number): number {
  return ms * 1.94384;
}

/**
 * Convert m/s to km/h
 */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Normalize altitude for visualization (0-1 range)
 */
export function normalizeAltitude(
  altitudeMeters: number,
  maxAltitude: number = 12000
): number {
  return Math.min(1, Math.max(0, altitudeMeters / maxAltitude));
}

/**
 * Get color based on altitude (blue = low, red = high)
 */
export function getAltitudeColor(altitudeMeters: number): string {
  const normalized = normalizeAltitude(altitudeMeters);

  // HSL interpolation from blue (240) to red (0)
  const hue = 240 - normalized * 240;
  return `hsl(${hue}, 80%, 50%)`;
}
