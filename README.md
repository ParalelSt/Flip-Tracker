# Flip Tracker

A small web app for tracking balisong practice — mark which tricks you can do,
log sessions, build combos, keep notes. Works without an account (data lives
in your browser); signing in syncs it to your account.

## Stack

- Next.js 16 (App Router) and React 19
- Tailwind v4 with shadcn/ui primitives
- Supabase for auth + Postgres
- TanStack Query for server state
- dnd-kit for the combo editor

## Running it locally

```bash
git clone <this repo>
cd flip-tracker
npm install
cp .env.example .env.local
# fill in your Supabase URL + anon key + service-role key
npm run dev
```

The dev server starts on http://localhost:3000.

### Supabase setup

1. Create a project at https://supabase.com.
2. In **Project Settings → API**, copy the Project URL, anon key, and
   service-role key into `.env.local`.
3. Open the SQL editor and run, in order:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
   - everything in `supabase/migrations/` (lowest number first)
4. In **Authentication → URL Configuration**, set the Site URL + Redirect URLs
   to your local + production URLs so email-confirm links land somewhere real.

## How it's organized

```
app/
  (app)/             auth-aware app shell: dashboard, tricks, sessions, combos, notes
  api/               route handlers (tricks, sessions, combos, notes, status)
  auth/              sign in / sign up
components/
  nav/               top nav, theme toggle
  player/            (unused here — leftover from the music-app sibling)
  providers/         Query / Auth / Theme contexts
  trick/             cards, pickers, filters, status pill
  combo/             sortable list for the editor
hooks/               TanStack Query wrappers (useQuery*, useExecute*)
lib/
  supabase/          server + browser + admin clients
  api.ts             client-side fetch wrapper; routes guests to localStorage
  localStore.ts      guest-mode storage (sessions, combos, notes, status)
  migrate.ts         pushes localStorage data to Supabase on sign-in
  video.ts           YouTube/Vimeo oEmbed fetcher + thumbnail helpers
supabase/
  schema.sql         tables + RLS
  seed.sql           canonical trick catalog (~25 entries)
  migrations/        ordered DDL + data backfills (video links, notes table, etc.)
```

## Guest mode

The app works fully without an account — trick statuses, sessions, combos and
notes are kept in `localStorage` under the `flip.local.*` keys. When a guest
signs up or signs in, `migrate.ts` pushes everything to Supabase, wipes the
local copy, and the UI refetches against the server.

Trick library reads are server-backed for everyone (RLS lets the `anon` role
select rows where `is_public = true`) so the seeded tricks show up immediately.

## Deploying

This is a stock Next.js app, so any Node host works. I run it on Vercel:

```bash
npx vercel              # first deploy → preview URL
npx vercel --prod       # promote to production
```

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` in the Vercel project's env settings, then add the
Vercel URL to Supabase's Site URL + Redirect URLs.

## Credit

Every reference video in the trick library is someone else's tutorial. The
in-app `/credits` page lists all the channels we link to — Big Flips, Squid
Industries, Calvin Van Arragon, Bali Tube, Benshamin Flips, cutlerylover,
lqkii_alt, Andux Balisong. Go subscribe to them.

## License

MIT — do whatever, just don't claim someone else's tutorial videos as your own.
