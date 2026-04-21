import { NextRequest, NextResponse } from 'next/server';
import { fetchFlightRoute } from '@/lib/api/opensky';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: NextRequest): Promise<NextResponse> {
  const callsign = req.nextUrl.searchParams.get('callsign');
  if (!callsign) {
    return NextResponse.json({ error: 'callsign required' }, { status: 400 });
  }
  try {
    const route = await fetchFlightRoute(callsign);
    return NextResponse.json({ route });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
