-- Supabase Schema for orbit-lab Flight Tracking
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Flight positions table - stores historical flight data
CREATE TABLE IF NOT EXISTS flight_positions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  icao24 text NOT NULL,           -- Unique aircraft identifier
  callsign text,                   -- Flight callsign (e.g., "UAL123")
  lat float8 NOT NULL,             -- Latitude
  lng float8 NOT NULL,             -- Longitude
  altitude float8,                 -- Altitude in meters
  velocity float8,                 -- Ground speed in m/s
  heading float8,                  -- True track in degrees (0-360)
  vertical_rate float8,            -- Vertical rate in m/s
  origin_country text,             -- Country of origin
  on_ground boolean DEFAULT false, -- Is the aircraft on ground?
  region text NOT NULL,            -- Region: 'usa', 'europe', 'eastAsia'
  recorded_at timestamptz DEFAULT now(),
  source text DEFAULT 'client',    -- 'client' or 'cron'

  -- Index for efficient queries
  CONSTRAINT flight_positions_region_check CHECK (region IN ('usa', 'europe', 'eastAsia'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_flight_positions_icao24 ON flight_positions(icao24);
CREATE INDEX IF NOT EXISTS idx_flight_positions_recorded_at ON flight_positions(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_flight_positions_region ON flight_positions(region);
CREATE INDEX IF NOT EXISTS idx_flight_positions_icao24_recorded ON flight_positions(icao24, recorded_at DESC);

-- App settings table - stores user preferences
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Default settings
INSERT INTO app_settings (key, value) VALUES
  ('refresh_interval', '30'),      -- seconds: 10, 30, 60, 300, or 0 (off)
  ('retention_days', '14'),        -- days to keep data
  ('client_tracking', 'true')      -- whether client sends positions
ON CONFLICT (key) DO NOTHING;

-- Function to clean old data (run via cron or trigger)
CREATE OR REPLACE FUNCTION cleanup_old_positions()
RETURNS void AS $$
DECLARE
  retention_days int;
BEGIN
  SELECT COALESCE(value::int, 14) INTO retention_days
  FROM app_settings WHERE key = 'retention_days';

  DELETE FROM flight_positions
  WHERE recorded_at < now() - (retention_days || ' days')::interval;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (optional but recommended)
ALTER TABLE flight_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for this demo (adjust for production)
CREATE POLICY "Allow anonymous access to flight_positions"
  ON flight_positions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to app_settings"
  ON app_settings FOR ALL
  USING (true)
  WITH CHECK (true);
