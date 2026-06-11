import { FetchArticlesParams, RawArticle } from "./types";

interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
}

function parseSeenDate(value?: string): string {
  const match = value?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return new Date().toISOString();
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

/** GDELT requires hyphenated words (e.g. "18-wheeler") to be quoted, or it rejects the query. */
function quoteHyphenatedWords(query: string): string {
  return query
    .split(" ")
    .map((word) => (word.includes("-") ? `"${word}"` : word))
    .join(" ");
}

export async function fetchFromGdelt({ query, window }: FetchArticlesParams): Promise<RawArticle[]> {
  const params = new URLSearchParams({
    query: `${quoteHyphenatedWords(query)} sourcelang:english`,
    mode: "artlist",
    format: "json",
    maxrecords: "50",
    timespan: window,
  });
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AccidentWatch/1.0)" },
  });
  if (!response.ok) throw new Error(`GDELT request failed: ${response.status}`);
  const text = await response.text();
  if (!text.trim().startsWith("{")) {
    throw new Error(`GDELT request failed: ${text.trim()}`);
  }
  const data = JSON.parse(text);
  const articles: GdeltArticle[] = data?.articles ?? [];

  return articles
    .filter((item) => item.title && item.url)
    .map((item) => ({
      title: item.title!,
      link: item.url!,
      source: item.domain ?? "Unknown",
      publishedAt: parseSeenDate(item.seendate),
    }));
}
