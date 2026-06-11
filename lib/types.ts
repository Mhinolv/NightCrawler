export type VehicleType = "18-wheeler" | "truck" | "service vehicle" | "other";

export interface Article {
  id: string;
  headline: string;
  url: string;
  source: string;
  publishedAt: string; // ISO timestamp
  state: string; // two-letter state code
  location?: string;
  vehicleType?: VehicleType;
  casualties?: string;
  summary?: string;
}

export interface SearchRequest {
  states: string[];
  keywords: string[];
  window: string;
  /** "newest" (default), "oldest", or "severity" (most severe first). */
  sort?: string;
  /** Max results to return. 0 or omitted means no limit. */
  limit?: number;
  /** "rss" (default), "bing", or "gdelt" — all free. */
  provider?: string;
}

export interface SearchResponse {
  articles: Article[];
  /** Number of relevant articles found, before the result limit is applied. */
  total: number;
  meta: {
    provider: string;
    queries: Array<{ state: string; query: string; count?: number; error?: string }>;
    /** Raw articles returned across all state/keyword queries, before dedup. */
    totalFetched: number;
    /** Articles remaining after deduping by title. */
    totalUnique: number;
    /** Unique articles actually sent to Claude for relevance/extraction. */
    totalScanned: number;
    /** True if totalUnique exceeded the extraction cap and some articles were skipped. */
    truncated: boolean;
  };
}
