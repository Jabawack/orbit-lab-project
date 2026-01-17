import { NextResponse } from 'next/server';
import { fetchFlights, getRateLimitInfo } from '@/lib/api/opensky';
import { saveFlightPositions } from '@/lib/supabase/flights';
import { cleanupOldPositions } from '@/lib/supabase/flights';
import type { RegionType } from '@/lib/supabase/types';

// Vercel cron job configuration
// Add to vercel.json:
// {
//   "crons": [
//     {
//       "path": "/api/cron/flights",
//       "schedule": "0 * * * *"
//     }
//   ]
// }

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for cron job

interface RegionResult {
  region: RegionType;
  fetched: number;
  saved: number;
  skipped: number;
  error?: string;
}

export async function GET(request: Request): Promise<NextResponse> {
  // Verify this is a legitimate cron request (optional security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify the request
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: RegionResult[] = [];

  // Fetch and save ALL regions
  const regionKeys: RegionType[] = ['usa', 'europe', 'eastAsia'];

  for (const region of regionKeys) {
    try {
      // Fetch flights for this region
      const flights = await fetchFlights(region);

      // Save to Supabase
      const { saved, skipped } = await saveFlightPositions(flights, region, 'cron');

      results.push({
        region,
        fetched: flights.length,
        saved,
        skipped,
      });

      // Small delay between region calls to be nice to OpenSky API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        region,
        fetched: 0,
        saved: 0,
        skipped: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Cleanup old positions
  let cleanedUp = 0;
  try {
    cleanedUp = await cleanupOldPositions();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }

  const duration = Date.now() - startTime;

  const rateLimitInfo = getRateLimitInfo();

  const summary = {
    success: true,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
    regions: results,
    totals: {
      fetched: results.reduce((sum, r) => sum + r.fetched, 0),
      saved: results.reduce((sum, r) => sum + r.saved, 0),
      skipped: results.reduce((sum, r) => sum + r.skipped, 0),
    },
    cleanup: {
      deleted: cleanedUp,
    },
    rateLimit: {
      remaining: rateLimitInfo.remaining,
      authenticated: rateLimitInfo.authenticated,
    },
  };

  console.log('Cron job completed:', JSON.stringify(summary, null, 2));

  return NextResponse.json(summary);
}
