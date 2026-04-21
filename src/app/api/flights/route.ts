import { NextRequest, NextResponse } from 'next/server';
import { fetchFlightStates, REGIONS, type RegionKey } from '@/lib/api/opensky';

// Server-side proxy for OpenSky API — browser calls are CORS-blocked
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const region = (request.nextUrl.searchParams.get('region') || 'usa') as RegionKey;
  const bounds = REGIONS[region];

  try {
    const states = await fetchFlightStates(bounds);
    return NextResponse.json({ states });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
