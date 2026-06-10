"use client";

import { useState } from "react";
import SearchSidebar, { SearchParams } from "@/components/SearchSidebar";
import ArticleCard from "@/components/ArticleCard";
import { severityRank } from "@/lib/casualties";
import { MOCK_ARTICLES } from "@/lib/mockData";
import { Article } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<Article[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch(params: SearchParams) {
    setLoading(true);
    setHasSearched(true);

    // Mock search: filter the local sample dataset by selected states.
    // Replace with a call to /api/search once the provider + extraction
    // pipeline is wired up.
    setTimeout(() => {
      const filtered = MOCK_ARTICLES.filter((article) =>
        params.states.includes(article.state)
      ).sort((a, b) => {
        switch (params.sort) {
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
      setTotal(filtered.length);
      setResults(params.limit > 0 ? filtered.slice(0, params.limit) : filtered);
      setLoading(false);
    }, 500);
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

            {hasSearched && !loading && results && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-ink-3">
                <p className="font-serif text-xl text-ink-2">No articles found</p>
                <p className="mt-1 text-sm">Try a different state or widen the date window.</p>
              </div>
            )}

            {hasSearched && !loading && results && results.length > 0 && (
              <>
                <p className="font-mono text-xs uppercase tracking-mono text-ink-3">
                  {results.length === total
                    ? `${results.length} ${results.length === 1 ? "result" : "results"}`
                    : `Showing ${results.length} of ${total} results`}
                </p>
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
