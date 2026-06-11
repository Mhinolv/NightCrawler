import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PROVIDER, ProviderValue, SortValue, US_STATES } from "@/lib/config";
import { normalizeTitle } from "@/lib/dedupe";
import { extractArticleDetails } from "@/lib/extract";
import { fetchArticles, NewsProvider, TimeWindow } from "@/lib/providers";
import { Article, SearchMeta, SearchRequest, SearchStreamEvent } from "@/lib/types";

const VALID_WINDOWS: TimeWindow[] = ["1d", "3d", "7d"];
const VALID_SORTS: SortValue[] = ["newest", "oldest", "severity"];
const VALID_PROVIDERS: ProviderValue[] = ["rss", "bing", "gdelt"];

/** Cap on how many deduped articles get sent to Claude per scan, to bound cost/latency. */
const MAX_EXTRACTION_CANDIDATES = 75;

/** GDELT enforces roughly one request per 5 seconds per IP. */
const GDELT_THROTTLE_MS = 5000;

/** Drops placeholder values (e.g. "unknown", "n/a") the model sometimes returns. */
function cleanField(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || /^(unknown|n\/a|none)$/i.test(trimmed.replace(/[<>]/g, ""))) {
    return undefined;
  }
  return trimmed;
}

export async function POST(req: NextRequest) {
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { states, keywords, window, sort = "newest", provider = DEFAULT_PROVIDER } = body;

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
  if (!VALID_SORTS.includes(sort as SortValue)) {
    return NextResponse.json(
      { error: `sort must be one of: ${VALID_SORTS.join(", ")}` },
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
      code,
      query: `${keyword} ${stateName}`,
    }));
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: SearchStreamEvent) {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      }

      const seenTitles = new Set<string>();
      const queryDebug: SearchMeta["queries"] = [];
      let nextId = 0;
      let totalFetched = 0;
      let totalUnique = 0;
      let totalScanned = 0;
      let lastGdeltRequestAt = 0;

      for (let i = 0; i < queries.length; i++) {
        const { code, query } = queries[i];
        send({ type: "query", state: code, query, index: i, total: queries.length });

        if (provider === "gdelt") {
          const wait = GDELT_THROTTLE_MS - (Date.now() - lastGdeltRequestAt);
          if (lastGdeltRequestAt > 0 && wait > 0) {
            await new Promise((resolve) => setTimeout(resolve, wait));
          }
          lastGdeltRequestAt = Date.now();
        }

        try {
          const raw = await fetchArticles({ query, window: window as TimeWindow }, provider as NewsProvider);
          totalFetched += raw.length;

          const newRaw = raw.filter((article) => {
            const key = normalizeTitle(article.title);
            if (seenTitles.has(key)) return false;
            seenTitles.add(key);
            return true;
          });
          totalUnique += newRaw.length;

          const remainingCapacity = Math.max(0, MAX_EXTRACTION_CANDIDATES - totalScanned);
          const toExtract = newRaw.slice(0, remainingCapacity);
          totalScanned += toExtract.length;

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
            .map((raw, index) => {
              const extraction = extractionById.get(String(index));
              if (!extraction || !extraction.relevant) return null;

              const article: Article = {
                id: String(nextId++),
                headline: raw.title,
                url: raw.link,
                source: raw.source,
                publishedAt: raw.publishedAt,
                state: code,
                location: cleanField(extraction.location),
                vehicleType: extraction.vehicleType,
                casualties: cleanField(extraction.casualties),
                summary: cleanField(extraction.summary),
              };
              return article;
            })
            .filter((a): a is Article => a !== null);

          send({ type: "articles", articles, state: code, query });
          queryDebug.push({ state: code, query, count: raw.length });
          console.log(`[search] (${provider}) "${query}" -> ${raw.length} result(s)`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          queryDebug.push({ state: code, query, error: message });
          send({ type: "error", state: code, query, error: message });
          console.error(`[search] (${provider}) "${query}" failed: ${message}`);
        }
      }

      send({
        type: "done",
        meta: {
          provider,
          queries: queryDebug,
          totalFetched,
          totalUnique,
          totalScanned,
          truncated: totalUnique > MAX_EXTRACTION_CANDIDATES,
        },
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
