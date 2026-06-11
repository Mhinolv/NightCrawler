import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { ProviderValue } from "@/lib/config";
import { TimeWindow } from "@/lib/providers";
import { SearchMeta, SearchStreamEvent } from "@/lib/types";

export interface ScanQuery {
  state: string;
  query: string;
}

export interface Scan {
  id: string;
  provider: ProviderValue;
  window: TimeWindow;
  queries: ScanQuery[];
  /** Append-only log that GET /api/search/[scanId]/stream replays and tails. */
  events: SearchStreamEvent[];
  /** Normalized titles seen so far, for cross-query dedupe. */
  seenTitles: Set<string>;
  queryDebug: SearchMeta["queries"];
  /** Queries that have begun processing. */
  started: number;
  /** Queries that finished (successfully or with an error). */
  settled: number;
  totalFetched: number;
  totalUnique: number;
  totalScanned: number;
  nextArticleId: number;
  finished: boolean;
  createdAt: number;
}

/** Scans are evicted this long after creation; any stream will have long closed. */
const SCAN_TTL_MS = 30 * 60_000;

class ScanStore {
  private scans = new Map<string, Scan>();
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  create(provider: ProviderValue, window: TimeWindow, queries: ScanQuery[]): Scan {
    this.evictExpired();
    const scan: Scan = {
      id: randomUUID(),
      provider,
      window,
      queries,
      events: [],
      seenTitles: new Set(),
      queryDebug: [],
      started: 0,
      settled: 0,
      totalFetched: 0,
      totalUnique: 0,
      totalScanned: 0,
      nextArticleId: 0,
      finished: false,
      createdAt: Date.now(),
    };
    this.scans.set(scan.id, scan);
    return scan;
  }

  get(id: string): Scan | undefined {
    const scan = this.scans.get(id);
    if (scan && Date.now() - scan.createdAt > SCAN_TTL_MS) {
      this.scans.delete(id);
      return undefined;
    }
    return scan;
  }

  append(scan: Scan, event: SearchStreamEvent): void {
    if (event.type === "done") scan.finished = true;
    scan.events.push(event);
    this.emitter.emit(scan.id);
  }

  /** Notifies `listener` whenever the scan gains events. Returns an unsubscribe function. */
  subscribe(id: string, listener: () => void): () => void {
    this.emitter.on(id, listener);
    return () => this.emitter.off(id, listener);
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [id, scan] of this.scans) {
      if (now - scan.createdAt > SCAN_TTL_MS) this.scans.delete(id);
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __scanStore: ScanStore | undefined;
}

/** Stashed on globalThis so all route modules share one instance across dev reloads. */
export const scanStore: ScanStore = (globalThis.__scanStore ??= new ScanStore());
