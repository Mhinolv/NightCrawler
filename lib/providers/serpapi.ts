import { FetchArticlesParams, RawArticle, TimeWindow } from "./types";

interface BingNewsResult {
  title?: string;
  link?: string;
  source?: string;
  date?: string;
  snippet?: string;
}

/** Bing News freshness filter codes: 7 = past day, 8 = past week. Bing has no 3-day option. */
const FRESHNESS_BY_WINDOW: Record<TimeWindow, string> = {
  "1d": "7",
  "3d": "8",
  "7d": "8",
};

const RELATIVE_DATE_UNIT_MS: Record<string, number> = {
  min: 60_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 7 * 86_400_000,
  mon: 30 * 86_400_000,
  y: 365 * 86_400_000,
};

/** Parses Bing's relative date strings (e.g. "14m", "3h", "5d") into ISO timestamps. */
function parseRelativeDate(value?: string): string {
  const now = Date.now();
  if (!value) return new Date(now).toISOString();

  const match = value.trim().match(/^(\d+)\s*(min|mon|h|d|w|y|m)$/i);
  if (match) {
    const amount = Number(match[1]);
    const unitMs = RELATIVE_DATE_UNIT_MS[match[2].toLowerCase()];
    return new Date(now - amount * unitMs).toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(now).toISOString() : parsed.toISOString();
}

export async function fetchFromSerpApi({
  query,
  window,
}: FetchArticlesParams): Promise<RawArticle[]> {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    throw new Error("SERP_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    engine: "bing_news",
    q: query,
    cc: "us",
    qft: `interval="${FRESHNESS_BY_WINDOW[window]}"`,
    api_key: apiKey,
  });

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.status}`);
  }

  const data = await response.json();
  const results: BingNewsResult[] = data?.organic_results ?? [];

  return results
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!,
      link: item.link!,
      source: item.source ?? "Unknown",
      publishedAt: parseRelativeDate(item.date),
      snippet: item.snippet,
    }));
}
