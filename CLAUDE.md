# Project Rules

## Git & Deployment Policy

- **NEVER commit, push, or deploy unless explicitly requested by the user.**
- **NEVER run `vercel`, `vercel --prod`, or any deployment commands** without explicit user permission.
- **NEVER mention Claude or AI in commit messages.** No "Co-Authored-By: Claude" or similar attribution.

## Environment Variables

Required for Supabase integration (optional - app works without):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key
- `CRON_SECRET` - Optional security for cron endpoint

## Key Paths

- Globe component: `src/components/Globe/index.tsx`
- Flight data hook: `src/hooks/useFlightData.ts`
- OpenSky API client: `src/lib/api/opensky.ts`
- Supabase schema: `src/lib/supabase/schema.sql`
- Airport database: `src/data/airports.ts`
