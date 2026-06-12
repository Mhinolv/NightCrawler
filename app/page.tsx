"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/FilterBar";
import ResultsTable from "@/components/ResultsTable";
import { getSeverity } from "@/lib/casualties";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_PROVIDER,
  PROVIDER_OPTIONS,
  ProviderValue,
  SEVERITY_OPTIONS,
  SORT_OPTIONS,
  SortValue,
  SeverityFilter,
  TIME_WINDOWS,
  US_STATES,
} from "@/lib/config";
import { SORT_COMPARATORS } from "@/lib/sort";
import { Article, SearchMeta, SearchStreamEvent, StartScanResponse } from "@/lib/types";

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

interface CurrentQuery {
  state: string;
  query: string;
}

interface ScanProgress {
  settled: number;
  total: number;
}

const DEFAULT_STATES = ["TX"];
const VALID_STATE_CODES = new Set(US_STATES.map((s) => s.code));
const VALID_WINDOWS = new Set(TIME_WINDOWS.map((w) => w.value));
const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((s) => s.value));
const VALID_PROVIDERS = new Set<string>(PROVIDER_OPTIONS.map((p) => p.value));
const VALID_SEVERITIES = new Set<string>(SEVERITY_OPTIONS.map((s) => s.value));

interface FilterState {
  states: string[];
  keywords: string[];
  window: string;
  sort: SortValue;
  provider: ProviderValue;
  severityFilter: SeverityFilter[];
}

/** Restores filter state from a bookmarked URL, falling back to defaults for anything invalid. */
function parseFiltersFromUrl(params: { get(name: string): string | null; getAll(name: string): string[] }): FilterState {
  const states = (params.get("states") ?? "")
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter((code) => VALID_STATE_CODES.has(code));
  const keywords = params
    .getAll("kw")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const window = params.get("window") ?? "";
  const sort = params.get("sort") ?? "";
  const provider = params.get("provider") ?? "";
  const severityFilter = (params.get("severity") ?? "")
    .split(",")
    .filter((s) => VALID_SEVERITIES.has(s)) as SeverityFilter[];

  return {
    states: states.length > 0 ? states : [...DEFAULT_STATES],
    keywords: keywords.length > 0 ? keywords : [DEFAULT_KEYWORDS[0]],
    window: VALID_WINDOWS.has(window) ? window : TIME_WINDOWS[0].value,
    sort: VALID_SORTS.has(sort) ? (sort as SortValue) : SORT_OPTIONS[0].value,
    provider: VALID_PROVIDERS.has(provider) ? (provider as ProviderValue) : DEFAULT_PROVIDER,
    severityFilter,
  };
}

function Home() {
  const searchParams = useSearchParams();
  // Parsed once on mount: the URL is the source of truth for the initial
  // filters, then filter changes write back to it via replaceState below.
  const initial = useMemo(
    () => parseFiltersFromUrl(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [states, setStates] = useState<string[]>(initial.states);
  const [keywords, setKeywords] = useState<string[]>(initial.keywords);
  const [customKeywords, setCustomKeywords] = useState<string[]>(
    initial.keywords.filter((k) => !DEFAULT_KEYWORDS.includes(k))
  );
  const [window, setWindow] = useState(initial.window);
  const [sort, setSort] = useState<SortValue>(initial.sort);
  const [provider, setProvider] = useState<ProviderValue>(initial.provider);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter[]>(initial.severityFilter);

  // Mirror filters into the URL (omitting defaults) so the page is bookmarkable.
  // replaceState avoids polluting browser history with every toggle.
  useEffect(() => {
    const params = new URLSearchParams();
    if (states.join(",") !== DEFAULT_STATES.join(",")) params.set("states", states.join(","));
    if (keywords.join("|") !== DEFAULT_KEYWORDS[0]) {
      for (const keyword of keywords) params.append("kw", keyword);
    }
    if (window !== TIME_WINDOWS[0].value) params.set("window", window);
    if (severityFilter.length > 0) params.set("severity", severityFilter.join(","));
    if (sort !== SORT_OPTIONS[0].value) params.set("sort", sort);
    if (provider !== DEFAULT_PROVIDER) params.set("provider", provider);
    const query = params.toString();
    globalThis.history.replaceState(null, "", query ? `?${query}` : globalThis.location.pathname);
  }, [states, keywords, window, severityFilter, sort, provider]);

  const [results, setResults] = useState<Article[] | null>(null);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<CurrentQuery | null>(null);
  const [progress, setProgress] = useState<ScanProgress | null>(null);

  function toggleKeyword(keyword: string) {
    setKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]));
  }

  function addCustomKeyword(keyword: string) {
    setCustomKeywords((prev) => [...prev, keyword]);
    setKeywords((prev) => [...prev, keyword]);
  }

  function removeCustomKeyword(keyword: string) {
    setCustomKeywords((prev) => prev.filter((k) => k !== keyword));
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  }

  async function handleSearch() {
    setLoading(true);
    setHasSearched(true);
    setError(null);
    setResults([]);
    setMeta(null);
    setCurrentQuery(null);
    setProgress(null);

    try {
      const startResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ states, keywords, window, provider }),
      });

      if (!startResponse.ok) {
        const body = await startResponse.json().catch(() => null);
        throw new Error(body?.error || `Search failed (${startResponse.status})`);
      }

      const { scanId, total }: StartScanResponse = await startResponse.json();
      setProgress({ settled: 0, total });

      const response = await fetch(`/api/search/${scanId}/stream`);
      if (!response.ok || !response.body) {
        throw new Error(`Result stream failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let settled = 0;
      const accumulated: Article[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event: SearchStreamEvent = JSON.parse(line);
          if (event.type === "query") {
            setCurrentQuery(event);
          } else if (event.type === "articles") {
            settled++;
            setProgress({ settled, total });
            if (event.articles.length > 0) {
              accumulated.push(...event.articles);
              setResults([...accumulated]);
            }
          } else if (event.type === "error") {
            settled++;
            setProgress({ settled, total });
          } else if (event.type === "done") {
            setMeta(event.meta);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
      setCurrentQuery(null);
      setProgress(null);
    }
  }

  const filteredResults = useMemo(() => {
    if (!results) return null;
    const filtered =
      severityFilter.length === 0
        ? results
        : results.filter((article) => severityFilter.includes(getSeverity(article.casualties) as SeverityFilter));
    return [...filtered].sort(SORT_COMPARATORS[sort]);
  }, [results, severityFilter, sort]);

  const fatalCount = useMemo(
    () => (results ?? []).filter((a) => getSeverity(a.casualties) === "fatal").length,
    [results]
  );
  const injuryCount = useMemo(
    () => (results ?? []).filter((a) => getSeverity(a.casualties) === "injury").length,
    [results]
  );

  const canSearch = !loading && states.length > 0 && keywords.length > 0;
  const windowLabel = TIME_WINDOWS.find((w) => w.value === window)?.short ?? window;
  const sortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.short ?? sort;
  const methodLabel = PROVIDER_OPTIONS.find((p) => p.value === provider)?.short ?? provider;
  const total = (results ?? []).length;

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="text-coral">
            <TargetIcon />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold uppercase tracking-mono text-ink">Nightcrawler</h1>
            <p className="font-mono text-[11px] uppercase tracking-mono text-ink-3">
              Accident Intelligence · PI Tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 truncate font-mono text-xs uppercase tracking-mono text-ink-3">
            <span
              className={`size-2 shrink-0 rounded-full ${loading ? "animate-pulse bg-positive" : "bg-ink-4"}`}
              aria-hidden
            />
            {loading && currentQuery
              ? `Searching ${currentQuery.state}: "${currentQuery.query}"${progress ? ` · ${progress.settled}/${progress.total} done` : ""}`
              : loading
                ? "Scanning"
                : "Idle"}
          </span>
          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch}
            className="shrink-0 rounded-md bg-coral px-5 py-2 text-sm font-semibold font-mono uppercase tracking-mono text-surface shadow-[0_8px_20px_rgba(239,68,68,0.24)] transition-colors hover:bg-coral-deep disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-4 disabled:shadow-none"
          >
            {loading ? "Scanning…" : "Run scan"}
          </button>
        </div>
      </header>

      <FilterBar
        states={states}
        onStatesChange={setStates}
        keywords={keywords}
        onKeywordsToggle={toggleKeyword}
        customKeywords={customKeywords}
        onAddCustomKeyword={addCustomKeyword}
        onRemoveCustomKeyword={removeCustomKeyword}
        window={window}
        onWindowChange={setWindow}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        sort={sort}
        onSortChange={setSort}
        provider={provider}
        onProviderChange={setProvider}
      />

      <main className="flex-1 overflow-y-auto">
        {!hasSearched && (
          <div className="flex h-full flex-col items-center justify-center py-24 text-center text-ink-3">
            <p className="text-lg font-semibold text-ink-2">Set your filters and run a scan</p>
            <p className="mt-1 text-sm">Results will appear here as a sortable table.</p>
          </div>
        )}

        {hasSearched && !error && filteredResults && filteredResults.length > 0 && (
          <ResultsTable articles={filteredResults} />
        )}

        {hasSearched && !error && loading && (!filteredResults || filteredResults.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 font-mono text-sm uppercase tracking-mono text-ink-3">
            Scanning for today&apos;s articles…
          </div>
        )}

        {hasSearched && !loading && error && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-coral">
            <p className="text-lg font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm text-ink-2">{error}</p>
          </div>
        )}

        {hasSearched && !loading && !error && filteredResults && filteredResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-ink-3">
            <p className="text-lg font-semibold text-ink-2">No articles found</p>
            <p className="mt-1 text-sm">Try a different state, severity filter, or widen the date window.</p>
          </div>
        )}
      </main>

      {hasSearched && !error && meta && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line bg-surface px-6 py-2 font-mono text-xs uppercase tracking-mono text-ink-3">
          <span>
            {(filteredResults ?? []).length} of {total} articles · Method — {methodLabel} · Window — {windowLabel} ·
            Sort — {sortLabel}
          </span>
          <span>
            Fatal: {fatalCount} · Injury: {injuryCount} · Scanned {meta.totalScanned}
            {meta.queries.some((q) => q.error) &&
              ` · Failed queries: ${meta.queries.filter((q) => q.error).length}`}
          </span>
        </footer>
      )}
    </div>
  );
}

export default function Page() {
  // useSearchParams requires a Suspense boundary during prerendering.
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
