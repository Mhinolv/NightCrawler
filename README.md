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
  `fetchArticles(query, window)` interface with two implementations:
  - **Google News RSS (default, free)** — best local-outlet coverage, no key.
  - **SerpAPI Google News engine (fallback)** — same Google index, but with an
    SLA; kicks in on rate-limit errors or via env flag. Pay-per-search, cheap
    at this volume (~500 searches/month).
  - **GDELT DOC 2.0 (later, supplementary)** — free; catches wire/broadcast
    items Google ranks poorly.
- **Claude API (Haiku)** — one batched call per search turns titles + snippets
  into structured JSON (location, vehicle type, casualties, summary) and filters
  false positives (lawyer ads, metaphorical uses). The filtering quality *is*
  the product.
- **Vercel (free tier)** — zero-ops deploy from Git; right-sized for a
  single-user favor.
- **No database in v1** — fetch-on-demand keeps it stateless. Add SQLite/
  Postgres later for history, "seen" tracking, or saved cases.

## Architecture

UI → `/api/search` → provider interface (RSS → SerpAPI fallback) → dedupe by
normalized title + URL → Claude extraction (relevance filter + detail JSON) →
card grid.

1. **Search API route** (`/api/search`) — takes `{ states[], keywords[],
   window }`, builds a query per state×keyword pair, fetches in parallel,
   parses, de-duplicates, sorts by publish date.
2. **Extraction step** — deduped list goes to Claude in a single prompt
   returning per-article `{ relevant, location, vehicle_type, casualties,
   summary }`. Irrelevant items are dropped before the UI.
3. **UI** — sidebar with state multi-select, keyword toggles (truck driver /
   18-wheeler / service vehicle + free-text custom terms), date-window picker;
   main pane of result cards with headline → original article link, source,
   time, and detail chips.

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
