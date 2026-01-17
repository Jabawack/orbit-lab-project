# orbit-lab-project

A reusable 3D globe visualization framework for real-time flight tracking.

**Live:** https://orbit-lab-project.vercel.app

## Features

- Real-time flight tracking using OpenSky Network API
- 3D globe with react-globe.gl
- Region switching (USA, Europe, East Asia)
- Airplane icons with heading direction
- Zoom controls
- Settings panel (refresh interval, data retention)
- Trajectory arc rendering (requires Supabase)
- Airport database for origin/destination inference

## Tech Stack

- Next.js 16
- React 19
- react-globe.gl (Three.js based)
- SWR for data fetching
- Supabase (optional, for flight history)
- TypeScript

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open http://localhost:3000 (or 3001 if 3000 is in use).

### Build for production

```bash
npm run build
```

## Git Workflow

### Push to main branch

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Create a new branch

```bash
git checkout -b feature/your-feature
# make changes
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

## Deployment

### Deploy to Vercel (Production)

```bash
npx vercel --prod
```

### Deploy preview (non-production)

```bash
npx vercel
```

### First-time setup

1. Run `npx vercel` and follow prompts to link project
2. Project name: `orbit-lab-project`

## Environment Variables

For Supabase integration (optional):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (replaces legacy anon key) |
| `CRON_SECRET` | Optional security for cron endpoint |

### Setting up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API Keys
3. Copy Project URL and publishable key (`sb_publishable_...`)
4. Add to Vercel: Settings → Environment Variables
5. Run schema: SQL Editor → paste `src/lib/supabase/schema.sql` → Run

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page (mode selector)
│   ├── flights/page.tsx      # Flight tracker page
│   └── api/cron/flights/     # Cron job for data collection
├── components/
│   ├── Globe/index.tsx       # Main globe component
│   └── panels/               # UI panels (Stats, Settings)
├── hooks/
│   ├── useFlightData.ts      # Flight data fetching
│   └── useTrajectoryData.ts  # Historical trajectory data
├── lib/
│   ├── api/opensky.ts        # OpenSky API client
│   └── supabase/             # Supabase client & queries
├── data/
│   └── airports.ts           # Airport database (~75 airports)
└── types/
    └── flight.ts             # TypeScript types
```

## API Rate Limits

OpenSky Network free tier: 4,000 calls/day (~1 call every 22 seconds)

Default refresh interval: 30 seconds

## Performance Notes

- Globe limits display to 500 flights max (highest altitude)
- Full flight count shown in stats panel
- HTML emoji elements are slow; WebGL points would be faster for 1000+ flights
