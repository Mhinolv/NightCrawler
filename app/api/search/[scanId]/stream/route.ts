import { NextRequest } from "next/server";
import { scanStore } from "@/lib/scan/store";

export const dynamic = "force-dynamic";

/** Keeps the connection alive through proxies while queued jobs are pending. */
const PING_INTERVAL_MS = 15_000;

/** Tails a scan's event log as NDJSON until the scan finishes. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const scan = scanStore.get(scanId);
  if (!scan) {
    return Response.json({ error: "Unknown or expired scan" }, { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let cursor = 0;
      let closed = false;

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(pingTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already errored or cancelled by the client.
        }
      };

      const flush = () => {
        if (closed) return;
        while (cursor < scan.events.length) {
          controller.enqueue(encoder.encode(`${JSON.stringify(scan.events[cursor++])}\n`));
        }
        if (scan.finished) close();
      };

      const unsubscribe = scanStore.subscribe(scanId, flush);
      const pingTimer = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode('{"type":"ping"}\n'));
      }, PING_INTERVAL_MS);
      req.signal.addEventListener("abort", close);

      flush();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
