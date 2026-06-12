import { normalizeTitle } from "@/lib/dedupe";
import { extractArticleDetails } from "@/lib/extract";
import { recordQueryResult, recordScanFinish } from "@/lib/metrics";
import { fetchArticles } from "@/lib/providers";
import { Article } from "@/lib/types";
import { Scan, scanStore } from "./store";

/** Cap on how many deduped articles get sent to Claude per scan, to bound cost/latency. */
const MAX_EXTRACTION_CANDIDATES = 75;

export interface ScanJobPayload {
  scanId: string;
  state: string;
  query: string;
  /** Echoed so HookDeck connection filters can route by provider (e.g. slower delivery for gdelt). */
  provider?: string;
}

/** Drops placeholder values (e.g. "unknown", "n/a") the model sometimes returns. */
function cleanField(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || /^(unknown|n\/a|none)$/i.test(trimmed.replace(/[<>]/g, ""))) {
    return undefined;
  }
  return trimmed;
}

function settle(scan: Scan): void {
  scan.settled++;
  if (scan.settled >= scan.queries.length && !scan.finished) {
    scanStore.append(scan, {
      type: "done",
      meta: {
        provider: scan.provider,
        queries: scan.queryDebug,
        totalFetched: scan.totalFetched,
        totalUnique: scan.totalUnique,
        totalScanned: scan.totalScanned,
        truncated: scan.totalUnique > MAX_EXTRACTION_CANDIDATES,
      },
    });
    void recordScanFinish(scan);
  }
}

/** Records a query as failed and settles it (used for fetch errors and enqueue failures). */
export function failScanQuery(scan: Scan, state: string, query: string, error: string): void {
  scan.queryDebug.push({ state, query, error });
  scanStore.append(scan, { type: "error", state, query, error });
  void recordQueryResult(scan.id, state, query, null, null, error);
  settle(scan);
}

/**
 * Processes one queued state×keyword query: fetch from the provider, dedupe
 * against the scan, extract details via Claude, and append results to the
 * scan's event log. Errors are recorded on the scan rather than thrown, so a
 * failed query never blocks the rest of the scan.
 */
export async function runScanQuery(payload: ScanJobPayload): Promise<{ ok: boolean; reason?: string }> {
  const scan = scanStore.get(payload.scanId);
  if (!scan) return { ok: false, reason: "unknown or expired scan" };
  if (scan.finished) return { ok: false, reason: "scan already finished" };

  const { state, query } = payload;
  scanStore.append(scan, {
    type: "query",
    state,
    query,
    index: scan.started++,
    total: scan.queries.length,
  });

  try {
    const raw = await fetchArticles({ query, window: scan.window }, scan.provider);
    scan.totalFetched += raw.length;

    const fresh = raw.filter((article) => {
      const key = normalizeTitle(article.title);
      if (scan.seenTitles.has(key)) return false;
      scan.seenTitles.add(key);
      return true;
    });
    scan.totalUnique += fresh.length;

    const capacity = Math.max(0, MAX_EXTRACTION_CANDIDATES - scan.totalScanned);
    const toExtract = fresh.slice(0, capacity);
    scan.totalScanned += toExtract.length;

    const extractions = await extractArticleDetails(
      toExtract.map((article, index) => ({
        id: String(index),
        title: article.title,
        source: article.source,
        snippet: article.snippet,
      }))
    );
    const extractionById = new Map(extractions.map((e) => [e.id, e]));

    const articles: Article[] = toExtract
      .map((article, index) => {
        const extraction = extractionById.get(String(index));
        if (!extraction || !extraction.relevant) return null;
        const result: Article = {
          id: String(scan.nextArticleId++),
          headline: article.title,
          url: article.link,
          source: article.source,
          publishedAt: article.publishedAt,
          state,
          location: cleanField(extraction.location),
          vehicleType: extraction.vehicleType,
          casualties: cleanField(extraction.casualties),
          summary: cleanField(extraction.summary),
        };
        return result;
      })
      .filter((a): a is Article => a !== null);

    scan.queryDebug.push({ state, query, count: raw.length });
    scanStore.append(scan, { type: "articles", articles, state, query });
    void recordQueryResult(scan.id, state, query, raw.length, articles.length, null);
    console.log(`[scan] (${scan.provider}) "${query}" -> ${raw.length} result(s)`);
    settle(scan);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[scan] (${scan.provider}) "${query}" failed: ${message}`);
    failScanQuery(scan, state, query, message);
  }
  return { ok: true };
}
