"use client";

import { useState } from "react";
import SearchSidebar, { SearchParams } from "@/components/SearchSidebar";
import ArticleCard from "@/components/ArticleCard";
import { Article, SearchResponse } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<Article[] | null>(null);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<SearchResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(params: SearchParams) {
    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
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

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-surface px-6 py-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-mono text-ink-3">
            Private Investigator Tools
          </p>
          <h1 className="font-serif text-2xl text-ink">Accident Watch</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SearchSidebar onSearch={handleSearch} loading={loading} />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {!hasSearched && (
              <div className="flex h-full flex-col items-center justify-center py-24 text-center text-ink-3">
                <p className="font-serif text-xl text-ink-2">
                  Select states and keywords, then run a search
                </p>
                <p className="mt-1 text-sm">Results will appear here as a list of cards.</p>
              </div>
            )}

            {hasSearched && loading && (
              <div className="flex flex-col items-center justify-center py-24 text-ink-3">
                Searching for today&apos;s articles…
              </div>
            )}

            {hasSearched && !loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-danger">
                <p className="font-serif text-xl">Something went wrong</p>
                <p className="mt-1 text-sm text-ink-2">{error}</p>
              </div>
            )}

            {hasSearched && !loading && !error && results && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-ink-3">
                <p className="font-serif text-xl text-ink-2">No articles found</p>
                <p className="mt-1 text-sm">Try a different state or widen the date window.</p>
                {meta && (
                  <p className="mt-3 font-mono text-xs uppercase tracking-mono text-ink-3">
                    Scanned {meta.totalScanned} of {meta.totalUnique} articles found
                  </p>
                )}
              </div>
            )}

            {hasSearched && !loading && !error && results && results.length > 0 && (
              <>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs uppercase tracking-mono text-ink-3">
                    {results.length === total
                      ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                      : `Showing ${results.length} of ${total} results`}
                  </p>
                  {meta && (
                    <p className="font-mono text-xs uppercase tracking-mono text-ink-4">
                      Scanned {meta.totalScanned} of {meta.totalUnique} articles found
                      {meta.truncated ? " (some skipped due to volume)" : ""}
                    </p>
                  )}
                </div>
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
