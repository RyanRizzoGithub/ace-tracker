# ACE Tracker

Store your **Confidence Profile** assessments and track how your results change
over time. Users upload the PDF they were sent; the app reads out the archetype
and every trait score, lets them confirm the values, and then charts each
trait and archetype over time.

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind v4)
- **Data / Auth / Storage:** Supabase (Postgres + Row-Level Security + Storage)
- **PDF extraction:** Anthropic Claude API (reads the PDF, returns structured JSON)
- **Charts:** Recharts
- **Hosting:** Vercel

---

## How it works

1. A signed-in user uploads a Confidence Profile PDF. It is stored privately in
   Supabase Storage under `reports/<user-id>/`.
2. `POST /api/extract` downloads that PDF and sends it to Claude, which returns
   the report date, headline archetype, narrative, and a score for each of the
   36 canonical traits.
3. The user reviews/edits the extracted values, then saves.
4. `POST /api/reports` writes one `reports` row and 36 `report_scores` rows.
5. The dashboard charts trait trends and archetype shifts across all reports.

The fixed taxonomy (6 archetypes × authentic/shadow sides × 3 traits) lives in
[`src/lib/taxonomy.ts`](src/lib/taxonomy.ts) and is the source of truth for both
extraction and display.

---

## Local setup

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), create a project. Then open the **SQL
Editor** and run the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This
creates the tables, row-level security policies, the private `reports` storage
bucket, and the signup trigger.

Enable email auth: **Authentication → Providers → Email** (magic links are on by
default). Under **Authentication → URL Configuration**, add your site URL and
`http://localhost:3000/auth/callback` (plus your Vercel URL later) as redirect
URLs.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally |

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Add the same environment variables from `.env.local` in the Vercel project
   settings (set `NEXT_PUBLIC_SITE_URL` to your production URL).
4. Add your Vercel URL + `/auth/callback` to Supabase's redirect URLs.
5. Deploy. Every push to the default branch auto-deploys.

---

## Notes

- Extraction uses `claude-opus-5` by default (see
  [`src/app/api/extract/route.ts`](src/app/api/extract/route.ts)). Switch the
  `EXTRACTION_MODEL` constant to `claude-sonnet-5` to cut extraction cost if
  accuracy holds on your reports.
- Every table is protected by row-level security keyed to `auth.uid()`, so users
  can only ever read or write their own reports and files.
