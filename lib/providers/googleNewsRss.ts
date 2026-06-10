import { XMLParser } from "fast-xml-parser";
import { FetchArticlesParams, RawArticle } from "./types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  source?: string | { "#text"?: string; "@_url"?: string };
}

function sourceName(item: RssItem): string {
  if (typeof item.source === "string") return item.source;
  if (item.source?.["#text"]) return item.source["#text"];

  // Fall back to "Headline - Source Name" title format.
  const title = item.title ?? "";
  const dashIndex = title.lastIndexOf(" - ");
  return dashIndex === -1 ? "Unknown" : title.slice(dashIndex + 3).trim();
}

function headline(item: RssItem): string {
  const title = item.title ?? "";
  const source = sourceName(item);
  if (source !== "Unknown" && title.endsWith(` - ${source}`)) {
    return title.slice(0, -(` - ${source}`.length)).trim();
  }
  return title;
}

export async function fetchFromGoogleNewsRss({
  query,
  window,
}: FetchArticlesParams): Promise<RawArticle[]> {
  const q = `${query} when:${window}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    q
  )}&hl=en-US&gl=US&ceid=US:en`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AccidentWatch/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`Google News RSS request failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);

  const items: RssItem[] = parsed?.rss?.channel?.item ?? [];
  const itemList = Array.isArray(items) ? items : [items];

  return itemList
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: headline(item),
      link: item.link!,
      source: sourceName(item),
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      snippet: item.description ? stripHtml(item.description) : undefined,
    }));
}
