import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PROVIDER, ProviderValue, US_STATES } from "@/lib/config";
import { TimeWindow } from "@/lib/providers";
import { failScanQuery, runScanQuery, ScanJobPayload } from "@/lib/scan/run";
import { Scan, scanStore } from "@/lib/scan/store";
import { SearchRequest, StartScanResponse } from "@/lib/types";

const VALID_WINDOWS: TimeWindow[] = ["1d", "3d", "7d"];
const VALID_PROVIDERS: ProviderValue[] = ["rss", "bing", "gdelt"];

/** GDELT enforces roughly one request per 5 seconds per IP (local fallback only). */
const GDELT_THROTTLE_MS = 5000;

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
  const payloads: ScanJobPayload[] = queries.map(({ state, query }) => ({
    scanId: scan.id,
    state,
    query,
    provider,
  }));

  const queueUrl = process.env.HOOKDECK_SOURCE_URL;
  if (queueUrl) {
    await Promise.all(
      payloads.map(async (payload) => {
        try {
          const res = await fetch(queueUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`HookDeck enqueue failed: ${res.status}`);
        } catch (err) {
          failScanQuery(scan, payload.state, payload.query, err instanceof Error ? err.message : String(err));
        }
      })
    );
  } else {
    // No HookDeck configured (e.g. local dev with no public URL): work the
    // queue in-process instead, pacing GDELT to its 1-per-5s limit.
    void runLocalQueue(scan, payloads);
  }

  const response: StartScanResponse = { scanId: scan.id, total: queries.length };
  return NextResponse.json(response, { status: 202 });
}

async function runLocalQueue(scan: Scan, payloads: ScanJobPayload[]) {
  for (let i = 0; i < payloads.length; i++) {
    await runScanQuery(payloads[i]);
    if (scan.provider === "gdelt" && i < payloads.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, GDELT_THROTTLE_MS));
    }
  }
}
