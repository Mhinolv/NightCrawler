# Setup Checklist — Accident Watch

Everything *you* (the maintainer) need to do, in order. Items marked 💰 may
cost money; items marked 🔑 produce a secret that goes in `.env.local` /
Vercel env vars and must never be committed.

## 1. Accounts & keys (before writing code)

- [ ] 🔑 **Anthropic API key** — console.anthropic.com → create key, add a
      small monthly spend limit (Haiku at this volume is cents/month).
      → `ANTHROPIC_API_KEY`
- [ ] 🔑💰 **SerpAPI account** — serpapi.com → sign up, grab the key. Start on
      the free tier; only upgrade if/when the RSS path actually rate-limits.
      → `SERPAPI_KEY`
- [ ] **GitHub repo** — create `accident-watch` (private), push this folder.
- [ ] **Vercel account** — vercel.com, sign in with GitHub, import the repo.
      Free Hobby tier is fine for one user.

## 2. Local development environment

- [ ] Install Node.js 20+ (`node -v` to check)
- [ ] Run the scaffold inside this folder:
      `npx create-next-app@latest . --typescript --app --no-src-dir`
- [ ] `npm install fast-xml-parser @anthropic-ai/sdk`
- [ ] Create `.env.local` with `ANTHROPIC_API_KEY` and `SERPAPI_KEY`
- [ ] Confirm `.env.local` is gitignored (it is — but verify before first push)

## 3. Validate the risky dependency FIRST

- [ ] Spike a 20-line script that hits Google News RSS with a real query, e.g.
      `"18-wheeler accident" Texas when:1d`, from your machine AND from a
      deployed Vercel function (their egress IPs behave differently than your
      laptop). Confirm results come back and links resolve.
- [ ] If RSS is flaky from Vercel, flip the env flag to SerpAPI and move on —
      that's exactly what the fallback is for.

## 4. Build milestone 1

- [ ] Provider interface + Google News RSS implementation
- [ ] `/api/search` route: fetch → dedupe → Claude extraction
- [ ] Card UI: one state, three default keywords, 24h window
- [ ] Deploy to Vercel; add both keys as Vercel environment variables

## 5. Hand-off to your friend

- [ ] Send him the Vercel URL to bookmark
- [ ] Sit with him one morning while he uses it on real cases — write down
      every accident he finds manually that the tool missed (recall gaps) and
      every junk card it showed (precision gaps)
- [ ] Tune the keyword config and extraction prompt from that list
- [ ] Decide on Vercel password protection or a simple shared secret if you
      don't want the URL publicly reachable

## 6. Ongoing maintenance (you signed up for this)

- [ ] Check Anthropic + SerpAPI usage dashboards after the first month
- [ ] Watch for Google News RSS format changes (parser errors in Vercel logs)
- [ ] Revisit: does he want a 6 a.m. pre-fetched digest? If yes, that's the
      trigger to add a small DB and a cron/n8n job calling the search route.
