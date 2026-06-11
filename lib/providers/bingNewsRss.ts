import { XMLParser } from "fast-xml-parser";
import { FetchArticlesParams, RawArticle, TimeWindow } from "./types";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const FRESHNESS_BY_WINDOW: Record<TimeWindow, string> = {
  "1d": "7",
  "3d": "8",
  "7d": "8",
};

interface BingRssItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  "News:Source"?: string;
}

function resolveLink(rawLink: string): string {
  try {
    const url = new URL(rawLink);
    const target = url.searchParams.get("url");
    return target ? decodeURIComponent(target) : rawLink;
  } catch {
    return rawLink;
  }
}

export async function fetchFromBingRss({ query, window }: FetchArticlesParams): Promise<RawArticle[]> {
  const params = new URLSearchParams({
    q: query,
    qft: `interval="${FRESHNESS_BY_WINDOW[window]}"`,
    format: "rss",
    form: "YFNR",
  });
  const url = `https://www.bing.com/news/search?${params.toString()}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AccidentWatch/1.0)" },
  });
  if (!response.ok) throw new Error(`Bing News RSS request failed: ${response.status}`);
  const xml = await response.text();
  const parsed = parser.parse(xml);
  const items: BingRssItem[] = parsed?.rss?.channel?.item ?? [];
  const itemList = Array.isArray(items) ? items : [items];

  return itemList
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!,
      link: resolveLink(item.link!),
      source: item["News:Source"] ?? "Unknown",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      snippet: item.description,
    }));
}
