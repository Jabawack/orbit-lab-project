'use client';

import { useState, useCallback } from 'react';
import type { FlightPoint } from '@/types/flight';

interface UseSelectedFlightReturn {
  selectedFlight: FlightPoint | null;
  selectFlight: (flight: FlightPoint | null) => void;
  clearSelection: () => void;
}

export function useSelectedFlight(): UseSelectedFlightReturn {
  const [selectedFlight, setSelectedFlight] = useState<FlightPoint | null>(null);

  const selectFlight = useCallback((flight: FlightPoint | null) => {
    setSelectedFlight(flight);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFlight(null);
  }, []);

  return {
    selectedFlight,
    selectFlight,
    clearSelection,
  };
}
