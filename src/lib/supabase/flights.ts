import { supabase, isSupabaseConfigured } from './client';
import type { FlightPosition, RegionType, SourceType, Settings, DEFAULT_SETTINGS } from './types';
import type { FlightPoint } from '@/types/flight';

// Minimum distance (km) or time (minutes) before storing new position
const MIN_DISTANCE_KM = 1;
const MIN_TIME_MINUTES = 5;

/**
 * Calculate distance between two points using Haversine formula
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if we should store a new position for this flight
 * (to avoid storing duplicate/near-duplicate positions)
 */
interface PositionRecord {
  lat: number;
  lng: number;
  recorded_at: string;
}

async function shouldStorePosition(
  icao24: string,
  lat: number,
  lng: number
): Promise<boolean> {
  if (!supabase) return false;

  const { data } = await supabase
    .from('flight_positions')
    .select('lat, lng, recorded_at')
    .eq('icao24', icao24)
    .order('recorded_at', { ascending: false })
    .limit(1);

  const records = data as PositionRecord[] | null;
  const lastPosition = records?.[0];
  if (!lastPosition) return true; // No previous position, store it

  // Check distance
  const distance = haversineDistance(
    lastPosition.lat,
    lastPosition.lng,
    lat,
    lng
  );
  if (distance >= MIN_DISTANCE_KM) return true;

  // Check time elapsed
  const lastTime = new Date(lastPosition.recorded_at).getTime();
  const now = Date.now();
  const minutesElapsed = (now - lastTime) / (1000 * 60);
  if (minutesElapsed >= MIN_TIME_MINUTES) return true;

  return false;
}

/**
 * Save flight positions to Supabase with smart deduplication
 */
export async function saveFlightPositions(
  flights: FlightPoint[],
  region: RegionType,
  source: SourceType = 'client'
): Promise<{ saved: number; skipped: number }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { saved: 0, skipped: flights.length };
  }

  const toInsert: FlightPosition[] = [];
  let skipped = 0;

  // Check each flight for deduplication
  for (const flight of flights) {
    const shouldStore = await shouldStorePosition(
      flight.icao24,
      flight.lat,
      flight.lng
    );

    if (shouldStore) {
      toInsert.push({
        id: crypto.randomUUID(),
        icao24: flight.icao24,
        callsign: flight.callsign || null,
        lat: flight.lat,
        lng: flight.lng,
        altitude: flight.alt,
        velocity: flight.velocity,
        heading: flight.heading,
        vertical_rate: flight.verticalRate,
        origin_country: flight.originCountry || null,
        on_ground: flight.onGround,
        region,
        recorded_at: new Date().toISOString(),
        source,
      });
    } else {
      skipped++;
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('flight_positions').insert(toInsert);
    if (error) {
      console.error('Error saving flight positions:', error);
      return { saved: 0, skipped: flights.length };
    }
  }

  return { saved: toInsert.length, skipped };
}

/**
 * Get flight history for a specific aircraft
 */
export async function getFlightHistory(
  icao24: string,
  hoursBack: number = 24
): Promise<FlightPosition[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('flight_positions')
    .select('*')
    .eq('icao24', icao24)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching flight history:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all recent flight positions for trajectory rendering
 */
export async function getRecentPositions(
  region?: RegionType,
  hoursBack: number = 6
): Promise<FlightPosition[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('flight_positions')
    .select('*')
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });

  if (region) {
    query = query.eq('region', region);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching recent positions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get settings from Supabase
 */
export async function getSettings(): Promise<Settings> {
  if (!isSupabaseConfigured() || !supabase) {
    return { refresh_interval: 30, retention_days: 14, client_tracking: true };
  }

  const { data, error } = await supabase.from('app_settings').select('*');

  if (error || !data) {
    return { refresh_interval: 30, retention_days: 14, client_tracking: true };
  }

  const settings: Settings = {
    refresh_interval: 30,
    retention_days: 14,
    client_tracking: true,
  };

  for (const row of data) {
    if (row.key === 'refresh_interval') {
      settings.refresh_interval = parseInt(row.value, 10) || 30;
    } else if (row.key === 'retention_days') {
      settings.retention_days = parseInt(row.value, 10) || 14;
    } else if (row.key === 'client_tracking') {
      settings.client_tracking = row.value === 'true';
    }
  }

  return settings;
}

/**
 * Update a setting in Supabase
 */
export async function updateSetting(
  key: string,
  value: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) {
    console.error('Error updating setting:', error);
    return false;
  }

  return true;
}

/**
 * Clean up old positions based on retention setting
 */
export async function cleanupOldPositions(): Promise<number> {
  if (!isSupabaseConfigured() || !supabase) return 0;

  const settings = await getSettings();
  const cutoff = new Date(
    Date.now() - settings.retention_days * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('flight_positions')
    .delete()
    .lt('recorded_at', cutoff)
    .select('id');

  if (error) {
    console.error('Error cleaning up old positions:', error);
    return 0;
  }

  return data?.length || 0;
}
