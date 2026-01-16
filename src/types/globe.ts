/**
 * Core globe type definitions
 */

export interface GlobePoint {
  lat: number;
  lng: number;
  size?: number;
  color?: string;
  label?: string;
}

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color?: string | [string, string];
  stroke?: number;
  dashLength?: number;
  dashGap?: number;
  dashAnimateTime?: number;
}

export interface GlobeConfig {
  globeImageUrl?: string;
  bumpImageUrl?: string;
  backgroundImageUrl?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
}

export interface CameraConfig {
  altitude?: number;
  lat?: number;
  lng?: number;
}
