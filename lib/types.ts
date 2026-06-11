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
  /** "rss" (default), "bing", or "gdelt" — all free. */
  provider?: string;
}

export interface SearchMeta {
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
}

/** Newline-delimited JSON events streamed from POST /api/search. */
export type SearchStreamEvent =
  | { type: "query"; state: string; query: string; index: number; total: number }
  | { type: "articles"; articles: Article[]; state: string; query: string }
  | { type: "error"; state: string; query: string; error: string }
  | { type: "done"; meta: SearchMeta };
