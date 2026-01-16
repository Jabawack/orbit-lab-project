'use client';

import React from 'react';
import type { FlightPoint } from '@/types/flight';
import { metersToFeet, msToKnots } from '@/lib/utils/coordinates';

interface InfoPanelProps {
  flight: FlightPoint | null;
  onClose?: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ flight, onClose }) => {
  if (!flight) return null;

  const altitudeFeet = Math.round(metersToFeet(flight.alt));
  const speedKnots = Math.round(msToKnots(flight.velocity));

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.callsign}>{flight.callsign}</h3>
        <button onClick={onClose} style={styles.closeButton}>
          ×
        </button>
      </div>
      <div style={styles.content}>
        <InfoRow label="ICAO" value={flight.id} />
        <InfoRow label="Origin" value={flight.origin} />
        <InfoRow label="Altitude" value={`${altitudeFeet.toLocaleString()} ft`} />
        <InfoRow label="Speed" value={`${speedKnots} kts`} />
        <InfoRow label="Heading" value={`${Math.round(flight.heading)}°`} />
        <InfoRow
          label="Position"
          value={`${flight.lat.toFixed(4)}, ${flight.lng.toFixed(4)}`}
        />
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={styles.row}>
    <span style={styles.label}>{label}</span>
    <span style={styles.value}>{value}</span>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 280,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  callsign: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 24,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: 14,
    fontWeight: 500,
  },
};

export default InfoPanel;
