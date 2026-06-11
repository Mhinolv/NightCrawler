# Accident Watch

A single-user web app for a private investigator's morning workflow: pick one or
more U.S. states, hit search, and get today's news articles about accidents
involving truck drivers, 18-wheelers, or service vehicles — each shown as a card
with the headline, source, publish time, and extracted key details (location,
vehicles involved, injuries/fatalities). Replaces an hour of manual browsing
with one page checked over coffee.

## Why this stack

- **Next.js (App Router, TypeScript)** — one deployable unit; API routes handle
  news fetching and LLM calls server-side, keeping API keys off the client and
  avoiding CORS.
- **News provider interface** — all fetching goes through a single
  `fetchArticles(query, window)` interface with three free, keyless
  implementations the user picks between in the UI:
  - **Google News RSS (default)** — best local-outlet coverage.
  - **Bing News RSS** — independent index; good fallback when Google
    rate-limits the server's IP.
  - **GDELT DOC 2.0** — catches wire/broadcast items the others rank poorly;
    hard-limited to ~1 request per 5 seconds per IP.
- **HookDeck queue** — searches are published as one event per state×keyword
  query to a HookDeck Source; HookDeck delivers them back to
  `/api/jobs/search` at a controlled rate (slow lane for GDELT, fast lane for
  the RSS providers). Results stream to the browser as each job lands. When
  `HOOKDECK_SOURCE_URL` is unset (local dev), the queue is worked in-process
  instead.
- **Claude API (Haiku)** — one batched call per search turns titles + snippets
  into structured JSON (location, vehicle type, casualties, summary) and filters
  false positives (lawyer ads, metaphorical uses). The filtering quality *is*
  the product.
- **Vercel (free tier)** — zero-ops deploy from Git; right-sized for a
  single-user favor.
- **No database in v1** — fetch-on-demand keeps it stateless. Add SQLite/
  Postgres later for history, "seen" tracking, or saved cases.

## Architecture

UI → `POST /api/search` (creates a scan, queues one HookDeck event per
state×keyword query) → HookDeck delivers each event to `POST /api/jobs/search`
(provider fetch → dedupe → Claude extraction) → results append to an
in-memory scan log → `GET /api/search/[scanId]/stream` tails the log as NDJSON
→ table rows appear as each query lands.

1. **Start scan** (`POST /api/search`) — takes `{ states[], keywords[],
   window, provider }`, creates an in-memory scan, publishes one event per
   state×keyword query to the HookDeck Source URL, and returns
   `{ scanId, total }`. Without `HOOKDECK_SOURCE_URL`, queries are processed
   in-process sequentially (GDELT paced to 1-per-5s).
2. **Job handler** (`POST /api/jobs/search`) — HookDeck delivery target
   (signature-verified). Fetches one query from the selected provider, dedupes
   against the scan, runs Claude extraction (`{ relevant, location,
   vehicle_type, casualties, summary }`), and appends results to the scan.
3. **Result stream** (`GET /api/search/[scanId]/stream`) — NDJSON stream of
   `query` / `articles` / `error` / `done` events; closes when every queued
   query has settled.
4. **UI** — filter bar (states, keywords, window, severity, sort, provider),
   live progress in the header showing the in-flight query and settled count,
   results table that grows as jobs finish.

### HookDeck setup (deployed)

1. Create a **Source** (e.g. `nightcrawler-scans`); put its URL in
   `HOOKDECK_SOURCE_URL`.
2. Create a **Destination** pointing at `https://<your-app>/api/jobs/search`.
3. Create two **Connections** from the source to that destination:
   - filter `body.provider == "gdelt"` → delivery rate **1 per 5 seconds**
     (GDELT's hard per-IP limit);
   - everything else → a faster rate (e.g. 5/second) to stay polite with the
     RSS endpoints.
4. Copy the source's signing secret into `HOOKDECK_SIGNING_SECRET`.

For local testing, `hookdeck listen 3000 <source> --path /api/jobs/search`
tunnels deliveries to the dev server — but note HookDeck does **not** apply
delivery rate limits to CLI destinations (they're test-only), so queued
events arrive immediately. Rate pacing only takes effect on the deployed
HTTP destination. Per-minute rates are evenly spread (12/minute = exactly
one delivery every 5 seconds).

Note: scan state lives in process memory, so the app must run as a single
long-lived Node server (`next start` on Railway/Fly/Render/VPS) — not on
serverless. HookDeck retries are intentionally unused: a failed query is
recorded on the scan and the scan completes without it.

Keywords live in editable config, not hardcoded — expect tuning in week one.

## Project structure (planned)

```
accident-watch/            (planned — directories created as code lands)
├── app/
│   ├── page.tsx           # main UI: sidebar + results grid
│   └── api/
│       └── search/
│           └── route.ts   # orchestrates fetch → dedupe → extract
├── lib/
│   ├── providers/
│   │   ├── types.ts       # fetchArticles(query, window) interface
│   │   ├── googleNewsRss.ts
│   │   ├── serpapi.ts
│   │   └── index.ts       # provider selection + fallback logic
│   ├── dedupe.ts
│   ├── extract.ts         # Claude extraction prompt + parsing
│   └── config.ts          # default keywords, states list
├── components/            # SearchSidebar, ArticleCard, etc.
├── .env.local             # SERPAPI_KEY, ANTHROPIC_API_KEY (never committed)
└── package.json
```

## Getting started

```bash
npx create-next-app@latest . --typescript --app --no-src-dir
npm install fast-xml-parser @anthropic-ai/sdk
cp .env.example .env.local   # then fill in keys (see SETUP-CHECKLIST.md)
npm run dev
```

## Roadmap

- [ ] **Milestone 1:** one state, three default keyword phrases, 24-hour
      window — search → RSS fetch → dedupe → Claude extraction → card list.
      No auth, no persistence. Deployed to Vercel.
- [ ] Multi-state search with per-state loading progress
- [ ] Custom keyword field + editable keyword config
- [ ] SerpAPI fallback path wired and tested under simulated rate-limiting
- [ ] GDELT as supplementary source
- [ ] (If wanted) 6 a.m. pre-fetched digest: cron/n8n calls the search route,
      results stored in a small DB

## Open questions

- Google News RSS stability — validate first; it's the load-bearing free
  dependency. Mitigate with modest parallelism, short in-memory cache,
  server-side redirect resolution.
- RSS snippets are thin — extract what the snippet supports in v1; full-text
  fetching (paywalls, bot-blocking) is a v2 experiment.
- "Service vehicles" is fuzzy — keyword set and extraction prompt will need
  tuning against his first week of real use.
- Does he eventually want a pre-fetched morning digest instead of on-demand
  search? Design the search route so a scheduler can call it.
