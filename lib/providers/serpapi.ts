import { FetchArticlesParams, RawArticle } from "./types";

interface SerpApiNewsResult {
  title?: string;
  link?: string;
  source?: { name?: string } | string;
  date?: string;
  iso_date?: string;
  snippet?: string;
}

function parseDate(isoDate?: string, date?: string): string {
  for (const candidate of [isoDate, date]) {
    if (!candidate) continue;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
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
    engine: "google_news",
    q: `${query} when:${window}`,
    hl: "en",
    gl: "us",
    api_key: apiKey,
  });

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.status}`);
  }

  const data = await response.json();
  const results: SerpApiNewsResult[] = data?.news_results ?? [];

  return results
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!,
      link: item.link!,
      source: typeof item.source === "string" ? item.source : item.source?.name ?? "Unknown",
      publishedAt: parseDate(item.iso_date, item.date),
      snippet: item.snippet,
    }));
}
