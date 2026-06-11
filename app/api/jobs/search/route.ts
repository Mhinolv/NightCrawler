import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { runScanQuery, ScanJobPayload } from "@/lib/scan/run";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * HookDeck signs deliveries with an HMAC-SHA256 of the raw body, base64-encoded,
 * in x-hookdeck-signature (and x-hookdeck-signature-2 during secret rotation).
 * Verification is skipped when HOOKDECK_SIGNING_SECRET is unset.
 */
function verifySignature(rawBody: string, req: NextRequest): boolean {
  const secret = process.env.HOOKDECK_SIGNING_SECRET;
  if (!secret) return true;
  const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
  return [req.headers.get("x-hookdeck-signature"), req.headers.get("x-hookdeck-signature-2")].some(
    (signature) => signature !== null && safeEqual(signature, digest)
  );
}

/** Delivery target for HookDeck: processes one queued state×keyword search. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: ScanJobPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!payload?.scanId || !payload?.state || !payload?.query) {
    return NextResponse.json({ error: "scanId, state, and query are required" }, { status: 400 });
  }

  const result = await runScanQuery(payload);
  // Always 200 once the delivery is understood: an unknown scan means the
  // server restarted or the scan expired, and a HookDeck retry can never
  // succeed — so report the outcome without failing the delivery.
  return NextResponse.json(result);
}
