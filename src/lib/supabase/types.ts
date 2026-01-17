export type RegionType = 'usa' | 'europe' | 'eastAsia';
export type SourceType = 'client' | 'cron';

export interface FlightPosition {
  id: string;
  icao24: string;
  callsign: string | null;
  lat: number;
  lng: number;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  vertical_rate: number | null;
  origin_country: string | null;
  on_ground: boolean;
  region: RegionType;
  recorded_at: string;
  source: SourceType;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: string;
}

// Supabase database type definitions
export interface Database {
  public: {
    Tables: {
      flight_positions: {
        Row: FlightPosition;
        Insert: Omit<FlightPosition, 'id' | 'recorded_at'> & {
          id?: string;
          recorded_at?: string;
        };
        Update: Partial<FlightPosition>;
      };
      app_settings: {
        Row: AppSetting;
        Insert: Omit<AppSetting, 'updated_at'> & { updated_at?: string };
        Update: Partial<AppSetting>;
      };
    };
  };
}

// Settings keys
export type SettingKey = 'refresh_interval' | 'retention_days' | 'client_tracking';

export interface Settings {
  refresh_interval: number;  // seconds
  retention_days: number;
  client_tracking: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  refresh_interval: 30,
  retention_days: 14,
  client_tracking: true,
};
