/**
 * Flight/Aviation type definitions for OpenSky Network API
 */

export interface FlightState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  timePosition: number | null;
  lastContact: number;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  sensors: number[] | null;
  geoAltitude: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: number;
}

export interface OpenSkyResponse {
  time: number;
  states: FlightStateArray[] | null;
}

// OpenSky returns arrays, not objects
export type FlightStateArray = [
  string, // icao24
  string | null, // callsign
  string, // origin_country
  number | null, // time_position
  number, // last_contact
  number | null, // longitude
  number | null, // latitude
  number | null, // baro_altitude
  boolean, // on_ground
  number | null, // velocity
  number | null, // true_track
  number | null, // vertical_rate
  number[] | null, // sensors
  number | null, // geo_altitude
  string | null, // squawk
  boolean, // spi
  number // position_source
];

export interface FlightPoint {
  id: string;           // icao24 identifier
  icao24: string;       // Same as id, for database compatibility
  lat: number;
  lng: number;
  alt: number;
  callsign: string;
  velocity: number;
  heading: number;
  verticalRate: number;
  origin: string;
  originCountry: string; // Same as origin, for database compatibility
  onGround: boolean;
}

/**
 * Parse OpenSky array response into FlightState object
 */
export function parseFlightState(arr: FlightStateArray): FlightState {
  return {
    icao24: arr[0],
    callsign: arr[1],
    originCountry: arr[2],
    timePosition: arr[3],
    lastContact: arr[4],
    longitude: arr[5],
    latitude: arr[6],
    baroAltitude: arr[7],
    onGround: arr[8],
    velocity: arr[9],
    trueTrack: arr[10],
    verticalRate: arr[11],
    sensors: arr[12],
    geoAltitude: arr[13],
    squawk: arr[14],
    spi: arr[15],
    positionSource: arr[16],
  };
}

/**
 * Convert FlightState to FlightPoint for globe visualization
 */
export function toFlightPoint(state: FlightState): FlightPoint | null {
  if (state.latitude === null || state.longitude === null) {
    return null;
  }

  return {
    id: state.icao24,
    icao24: state.icao24,
    lat: state.latitude,
    lng: state.longitude,
    alt: state.baroAltitude ?? state.geoAltitude ?? 0,
    callsign: state.callsign?.trim() || state.icao24,
    velocity: state.velocity ?? 0,
    heading: state.trueTrack ?? 0,
    verticalRate: state.verticalRate ?? 0,
    origin: state.originCountry,
    originCountry: state.originCountry,
    onGround: state.onGround,
  };
}
