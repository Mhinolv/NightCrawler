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
}
