import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PROVIDER, ProviderValue, US_STATES } from "@/lib/config";
import { recordScanStart } from "@/lib/metrics";
import { TimeWindow } from "@/lib/providers";
import { failScanQuery, runScanQuery, ScanJobPayload } from "@/lib/scan/run";
import { Scan, scanStore } from "@/lib/scan/store";
import { SearchRequest, StartScanResponse } from "@/lib/types";

const VALID_WINDOWS: TimeWindow[] = ["1d", "3d", "7d"];
const VALID_PROVIDERS: ProviderValue[] = ["rss", "bing", "gdelt"];

/**
 * Spacing between searches in the local (no-HookDeck) fallback, matching the
 * production HookDeck delivery rate. Protects Google/Bing from IP rate limits
 * and respects GDELT's hard 1-per-5s cap.
 */
const QUERY_THROTTLE_MS = 5000;

/** Publish pacing: stay under HookDeck's 5-events/second project throughput cap. */
const PUBLISH_BATCH_SIZE = 4;
const PUBLISH_BATCH_INTERVAL_MS = 1000;
/** Backoff schedule for failed publishes (429s or network errors). */
const PUBLISH_RETRY_DELAYS_MS = [1000, 2000, 4000];

export async function POST(req: NextRequest) {
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { states, keywords, window, provider = DEFAULT_PROVIDER } = body;

  if (!Array.isArray(states) || states.length === 0) {
    return NextResponse.json({ error: "states must be a non-empty array" }, { status: 400 });
  }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "keywords must be a non-empty array" }, { status: 400 });
  }
  if (!VALID_WINDOWS.includes(window as TimeWindow)) {
    return NextResponse.json(
      { error: `window must be one of: ${VALID_WINDOWS.join(", ")}` },
      { status: 400 }
    );
  }
  if (!VALID_PROVIDERS.includes(provider as ProviderValue)) {
    return NextResponse.json(
      { error: `provider must be one of: ${VALID_PROVIDERS.join(", ")}` },
      { status: 400 }
    );
  }

  const stateNameByCode = new Map(US_STATES.map((s) => [s.code, s.name]));

  const queries = states.flatMap((code) => {
    const stateName = stateNameByCode.get(code);
    if (!stateName) return [];
    return keywords.map((keyword) => ({
      state: code,
      query: `${keyword} ${stateName}`,
    }));
  });

  if (queries.length === 0) {
    return NextResponse.json({ error: "no valid states given" }, { status: 400 });
  }

  const scan = scanStore.create(provider as ProviderValue, window as TimeWindow, queries);
  void recordScanStart(scan, states, keywords);
  const payloads: ScanJobPayload[] = queries.map(({ state, query }) => ({
    scanId: scan.id,
    state,
    query,
    provider,
  }));

  const queueUrl = process.env.HOOKDECK_SOURCE_URL;
  if (queueUrl) {
    void publishToQueue(scan, payloads, queueUrl);
  } else {
    // No HookDeck configured (e.g. local dev with no public URL): work the
    // queue in-process instead, with the same per-search pacing the HookDeck
    // delivery rate provides in production.
    void runLocalQueue(scan, payloads);
  }

  const response: StartScanResponse = { scanId: scan.id, total: queries.length };
  return NextResponse.json(response, { status: 202 });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Publishes events to HookDeck in paced batches to stay under the project's
 * 5-events/second throughput cap. Runs detached: the search response returns
 * immediately while queries enter the queue over the first seconds of a scan.
 */
async function publishToQueue(scan: Scan, payloads: ScanJobPayload[], queueUrl: string) {
  for (let i = 0; i < payloads.length; i += PUBLISH_BATCH_SIZE) {
    const batch = payloads.slice(i, i + PUBLISH_BATCH_SIZE);
    await Promise.all(batch.map((payload) => publishOne(scan, payload, queueUrl)));
    if (i + PUBLISH_BATCH_SIZE < payloads.length) {
      await sleep(PUBLISH_BATCH_INTERVAL_MS);
    }
  }
}

async function publishOne(scan: Scan, payload: ScanJobPayload, queueUrl: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    let failure: string;
    try {
      const res = await fetch(queueUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return;
      failure = `HookDeck enqueue failed: ${res.status}`;
      // Client errors other than 429 (over throughput) won't succeed on retry.
      if (res.status < 500 && res.status !== 429) {
        failScanQuery(scan, payload.state, payload.query, failure);
        return;
      }
    } catch (err) {
      failure = err instanceof Error ? err.message : String(err);
    }
    if (attempt >= PUBLISH_RETRY_DELAYS_MS.length) {
      failScanQuery(scan, payload.state, payload.query, failure);
      return;
    }
    await sleep(PUBLISH_RETRY_DELAYS_MS[attempt]);
  }
}

async function runLocalQueue(scan: Scan, payloads: ScanJobPayload[]) {
  for (let i = 0; i < payloads.length; i++) {
    await runScanQuery(payloads[i]);
    if (i < payloads.length - 1) {
      await sleep(QUERY_THROTTLE_MS);
    }
  }
}
