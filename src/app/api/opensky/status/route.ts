import { NextResponse } from 'next/server';
import { getRateLimitInfo } from '@/lib/api/opensky';

export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  const rateLimitInfo = getRateLimitInfo();

  const hasCredentials = !!(
    process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET
  );

  return NextResponse.json({
    configured: hasCredentials,
    rateLimit: {
      remaining: rateLimitInfo.remaining,
      retryAfterSeconds: rateLimitInfo.retryAfterSeconds,
      lastUpdated: rateLimitInfo.lastUpdated
        ? new Date(rateLimitInfo.lastUpdated).toISOString()
        : null,
      authenticated: rateLimitInfo.authenticated,
    },
    limits: {
      anonymous: 400,
      authenticated: 4000,
      activeContributor: 8000,
    },
  });
}
