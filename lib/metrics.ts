import { Pool } from "pg";
import { Scan } from "./scan/store";

/**
 * Scan/query metrics recording to Postgres (Neon). Every function is
 * fire-and-forget and swallows errors after logging: metrics must never
 * break or slow a scan. All writes are no-ops when DATABASE_URL is unset.
 */

declare global {
  // eslint-disable-next-line no-var
  var __metricsPool: Pool | null | undefined;
}

function getPool(): Pool | null {
  if (globalThis.__metricsPool !== undefined) return globalThis.__metricsPool;
  const url = process.env.DATABASE_URL;
  globalThis.__metricsPool = url ? new Pool({ connectionString: url, max: 3 }) : null;
  return globalThis.__metricsPool;
}

export async function recordScanStart(scan: Scan, states: string[], keywords: string[]): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO scans (id, provider, time_window, states, keywords, total_queries)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [scan.id, scan.provider, scan.window, states, keywords, scan.queries.length]
    );
  } catch (err) {
    console.error(`[metrics] failed to record scan start: ${err instanceof Error ? err.message : err}`);
  }
}

export async function recordQueryResult(
  scanId: string,
  state: string,
  query: string,
  fetchedCount: number | null,
  relevantCount: number | null,
  error: string | null
): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO scan_queries (scan_id, state, query, fetched_count, relevant_count, error)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [scanId, state, query, fetchedCount, relevantCount, error]
    );
  } catch (err) {
    console.error(`[metrics] failed to record query result: ${err instanceof Error ? err.message : err}`);
  }
}

export async function recordScanFinish(scan: Scan): Promise<void> {
  const pool = getPool();
  if (!pool) return;
  try {
    await pool.query(
      `UPDATE scans
       SET finished_at = now(), failed_queries = $2, total_fetched = $3,
           total_unique = $4, total_scanned = $5, relevant_articles = $6
       WHERE id = $1`,
      [
        scan.id,
        scan.queryDebug.filter((q) => q.error).length,
        scan.totalFetched,
        scan.totalUnique,
        scan.totalScanned,
        scan.nextArticleId,
      ]
    );
  } catch (err) {
    console.error(`[metrics] failed to record scan finish: ${err instanceof Error ? err.message : err}`);
  }
}
