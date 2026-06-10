export type TimeWindow = "1d" | "3d" | "7d";

export type NewsProvider = "rss" | "serpapi";

export interface FetchArticlesParams {
  /** Search query, e.g. `"18-wheeler accident" Texas` */
  query: string;
  window: TimeWindow;
}

export interface RawArticle {
  title: string;
  link: string;
  source: string;
  /** ISO 8601 timestamp */
  publishedAt: string;
  snippet?: string;
}

export type FetchArticles = (params: FetchArticlesParams) => Promise<RawArticle[]>;
