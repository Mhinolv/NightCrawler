import { NextRequest, NextResponse } from "next/server";
import { severityRank } from "@/lib/casualties";
import { DEFAULT_PROVIDER, ProviderValue, SortValue, US_STATES } from "@/lib/config";
import { dedupeArticles } from "@/lib/dedupe";
import { extractArticleDetails } from "@/lib/extract";
import { fetchArticles, NewsProvider, RawArticle, TimeWindow } from "@/lib/providers";
import { Article, SearchRequest } from "@/lib/types";

const VALID_WINDOWS: TimeWindow[] = ["1d", "3d", "7d"];
const VALID_SORTS: SortValue[] = ["newest", "oldest", "severity"];
const VALID_PROVIDERS: ProviderValue[] = ["rss", "serpapi"];

/** Cap on how many deduped articles get sent to Claude per search, to bound cost/latency. */
const MAX_EXTRACTION_CANDIDATES = 75;

interface StateRawArticle extends RawArticle {
  state: string;
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

export async function POST(req: NextRequest) {
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { states, keywords, window, sort = "newest", limit = 0, provider = DEFAULT_PROVIDER } = body;

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
  if (typeof limit !== "number" || limit < 0) {
    return NextResponse.json({ error: "limit must be a non-negative number" }, { status: 400 });
  }
  if (!VALID_PROVIDERS.includes(provider as ProviderValue)) {
    return NextResponse.json(
      { error: `provider must be one of: ${VALID_PROVIDERS.join(", ")}` },
      { status: 400 }
    );
  }
  if (provider === "serpapi" && !process.env.SERP_API_KEY) {
    return NextResponse.json({ error: "SerpAPI is not configured" }, { status: 400 });
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

  const results = await Promise.allSettled(
    queries.map(async ({ code, query }) => {
      const articles = await fetchArticles(
        { query, window: window as TimeWindow },
        provider as NewsProvider
      );
      return articles.map((article): StateRawArticle => ({ ...article, state: code }));
    })
  );

  const queryDebug = results.map((result, i) => ({
    state: queries[i].code,
    query: queries[i].query,
    ...(result.status === "fulfilled"
      ? { count: result.value.length }
      : { error: result.reason instanceof Error ? result.reason.message : String(result.reason) }),
  }));

  for (const entry of queryDebug) {
    if ("error" in entry) {
      console.error(`[search] (${provider}) "${entry.query}" failed: ${entry.error}`);
    } else {
      console.log(`[search] (${provider}) "${entry.query}" -> ${entry.count} result(s)`);
    }
  }

  const rawArticles = results
    .filter((r): r is PromiseFulfilledResult<StateRawArticle[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const dedupedAll = dedupeArticles(rawArticles).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const deduped = dedupedAll.slice(0, MAX_EXTRACTION_CANDIDATES);

  const extractionInputs = deduped.map((article, index) => ({
    id: String(index),
    title: article.title,
    source: article.source,
    snippet: article.snippet,
  }));

  const extractions = await extractArticleDetails(extractionInputs);
  const extractionById = new Map(extractions.map((e) => [e.id, e]));

  const articles: Article[] = deduped
    .map((raw, index) => {
      const extraction = extractionById.get(String(index));
      if (!extraction || !extraction.relevant) return null;

      const article: Article = {
        id: String(index),
        headline: raw.title,
        url: raw.link,
        source: raw.source,
        publishedAt: raw.publishedAt,
        state: raw.state,
        location: cleanField(extraction.location),
        vehicleType: extraction.vehicleType,
        casualties: cleanField(extraction.casualties),
        summary: cleanField(extraction.summary),
      };
      return article;
    })
    .filter((a): a is Article => a !== null)
    .sort((a, b) => {
      switch (sort as SortValue) {
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case "severity": {
          const rankDiff = severityRank(a.casualties) - severityRank(b.casualties);
          if (rankDiff !== 0) return rankDiff;
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        }
        case "newest":
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  const limited = limit > 0 ? articles.slice(0, limit) : articles;

  return NextResponse.json({
    articles: limited,
    total: articles.length,
    meta: {
      provider,
      queries: queryDebug,
      totalFetched: rawArticles.length,
      totalUnique: dedupedAll.length,
      totalScanned: deduped.length,
      truncated: dedupedAll.length > MAX_EXTRACTION_CANDIDATES,
    },
  });
}
