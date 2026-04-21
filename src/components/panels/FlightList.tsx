'use client';

import React, { useMemo, useState } from 'react';
import type { FlightPoint } from '@/types/flight';
import { metersToFeet, msToKnots } from '@/lib/utils/coordinates';

interface FlightListProps {
  flights?: FlightPoint[];
  selectedFlight: FlightPoint | null;
  onSelect: (flight: FlightPoint) => void;
}

const EMPTY_FLIGHTS: FlightPoint[] = [];

export const FlightList: React.FC<FlightListProps> = ({
  flights = EMPTY_FLIGHTS,
  selectedFlight,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const sorted = [...flights].sort((a, b) => b.alt - a.alt);
    if (!query.trim()) return sorted.slice(0, 100);
    const q = query.trim().toLowerCase();
    return sorted.filter((f) => (f.callsign || f.id).toLowerCase().includes(q)).slice(0, 100);
  }, [flights, query]);

  return (
    <div style={styles.panel} className="panel-flightlist">
      <div style={styles.header}>
        <span style={styles.title}>Flights</span>
        <span style={styles.count}>{flights.length}</span>
      </div>
      <div style={styles.searchWrap}>
        <input
          type="text"
          placeholder="Search callsign…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.search}
        />
        {query && (
          <button onClick={() => setQuery('')} style={styles.clearBtn}>×</button>
        )}
      </div>
      <div style={styles.list}>
        {filtered.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          return (
            <button
              key={flight.id}
              onClick={() => onSelect(flight)}
              style={{ ...styles.row, ...(isSelected ? styles.rowSelected : {}) }}
            >
              <span style={styles.callsign}>{flight.callsign || flight.id}</span>
              <span style={styles.meta}>
                {Math.round(metersToFeet(flight.alt)).toLocaleString()} ft
              </span>
              <span style={styles.meta}>{Math.round(msToKnots(flight.velocity))} kts</span>
              <span style={{ ...styles.heading, transform: `rotate(${flight.heading}deg)` }}>
                ▲
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={styles.empty}>
            {query ? `No flights matching "${query}"` : 'No flights loaded'}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    top: 56,
    left: 252,
    width: 260,
    maxHeight: 460,
    backgroundColor: 'var(--panel)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--text)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
  },
  header: {
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text)',
  },
  count: {
    background: 'var(--accent)',
    color: 'var(--accent-contrast)',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 10,
    fontWeight: 700,
  },
  searchWrap: {
    position: 'relative',
    padding: '8px 10px',
    borderBottom: '1px solid var(--border)',
  },
  search: {
    width: '100%',
    padding: '5px 28px 5px 8px',
    background: 'var(--border)',
    border: '1px solid var(--border-strong)',
    borderRadius: 4,
    color: 'var(--text)',
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 16,
    cursor: 'pointer',
    padding: '0 2px',
    lineHeight: 1,
  },
  list: {
    overflowY: 'auto',
    flex: 1,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '7px 14px',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 12,
    transition: 'background 0.15s',
  },
  rowSelected: {
    background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
    boxShadow: 'inset 3px 0 0 var(--accent)',
  },
  callsign: {
    flex: 1,
    fontWeight: 600,
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    fontSize: 11,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  heading: {
    fontSize: 10,
    display: 'inline-block',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  empty: {
    padding: 16,
    fontSize: 12,
    color: 'var(--text-faint)',
    textAlign: 'center',
  },
};

export default FlightList;
