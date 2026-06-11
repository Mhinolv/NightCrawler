"use client";

import { useMemo, useState } from "react";
import FilterBar from "@/components/FilterBar";
import ResultsTable from "@/components/ResultsTable";
import { getSeverity } from "@/lib/casualties";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_PROVIDER,
  PROVIDER_OPTIONS,
  ProviderValue,
  SORT_OPTIONS,
  SortValue,
  SeverityFilter,
  TIME_WINDOWS,
  US_STATES,
} from "@/lib/config";
import { Article, SearchResponse } from "@/lib/types";

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  const [states, setStates] = useState<string[]>(["TX"]);
  const [keywords, setKeywords] = useState<string[]>([DEFAULT_KEYWORDS[0]]);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [window, setWindow] = useState(TIME_WINDOWS[0].value);
  const [sort, setSort] = useState<SortValue>(SORT_OPTIONS[0].value);
  const [provider, setProvider] = useState<ProviderValue>(DEFAULT_PROVIDER);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter[]>([]);

  const [results, setResults] = useState<Article[] | null>(null);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<SearchResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ states, keywords, window, sort, provider }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Search failed (${response.status})`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.articles);
      setTotal(data.total);
      setMeta(data.meta);
    } catch (err) {
      setResults(null);
      setTotal(0);
      setMeta(null);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  const filteredResults = useMemo(() => {
    if (!results) return null;
    if (severityFilter.length === 0) return results;
    return results.filter((article) => severityFilter.includes(getSeverity(article.casualties) as SeverityFilter));
  }, [results, severityFilter]);

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
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-mono text-ink-3">
            <span
              className={`size-2 rounded-full ${loading ? "animate-pulse bg-positive" : "bg-ink-4"}`}
              aria-hidden
            />
            {loading ? "Scanning" : "Idle"}
          </span>
          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch}
            className="rounded-md bg-coral px-5 py-2 text-sm font-semibold font-mono uppercase tracking-mono text-surface shadow-[0_8px_20px_rgba(239,68,68,0.24)] transition-colors hover:bg-coral-deep disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-4 disabled:shadow-none"
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

        {hasSearched && loading && (
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

        {hasSearched && !loading && !error && filteredResults && filteredResults.length > 0 && (
          <ResultsTable articles={filteredResults} />
        )}
      </main>

      {hasSearched && !loading && !error && meta && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line bg-surface px-6 py-2 font-mono text-xs uppercase tracking-mono text-ink-3">
          <span>
            {(filteredResults ?? []).length} of {total} articles · Method — {methodLabel} · Window — {windowLabel} ·
            Sort — {sortLabel}
          </span>
          <span>
            Fatal: {fatalCount} · Injury: {injuryCount} · Scanned {meta.totalScanned}
          </span>
        </footer>
      )}
    </div>
  );
}
