import { FetchArticlesParams, RawArticle } from "./types";

interface SerpApiNewsResult {
  title?: string;
  link?: string;
  source?: { name?: string } | string;
  date?: string;
  snippet?: string;
}

function parseDate(date?: string): string {
  if (!date) return new Date().toISOString();
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
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
      publishedAt: parseDate(item.date),
      snippet: item.snippet,
    }));
}
