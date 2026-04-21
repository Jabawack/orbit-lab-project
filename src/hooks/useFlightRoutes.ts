'use client';

import { useRef, useState, useEffect } from 'react';

interface RouteResult {
  originIcao: string;
  destIcao: string;
}

export function useFlightRoutes(callsigns: string[]): Map<string, RouteResult> {
  const cache = useRef<Map<string, RouteResult | null>>(new Map());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unknown = callsigns.filter((cs) => !cache.current.has(cs)).slice(0, 10);
    if (unknown.length === 0) return;

    Promise.all(
      unknown.map((cs) =>
        fetch(`/api/routes?callsign=${encodeURIComponent(cs)}`)
          .then((r) => r.json())
          .then((d) => ({ cs, route: d.route as RouteResult | null }))
          .catch(() => ({ cs, route: null }))
      )
    ).then((results) => {
      for (const { cs, route } of results) cache.current.set(cs, route);
      forceUpdate((n) => n + 1);
    });
  }, [callsigns]);

  const out = new Map<string, RouteResult>();
  for (const [cs, route] of cache.current) {
    if (route) out.set(cs, route);
  }
  return out;
}
