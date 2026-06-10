"use client";

import { useState } from "react";
import SearchSidebar, { SearchParams } from "@/components/SearchSidebar";
import ArticleCard from "@/components/ArticleCard";
import { MOCK_ARTICLES } from "@/lib/mockData";
import { Article } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<Article[] | null>(null);
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
      ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setResults(filtered);
      setLoading(false);
    }, 500);
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Accident Watch</h1>
          <p className="text-sm text-slate-500">
            Daily news scan for truck, 18-wheeler, and service vehicle accidents
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <SearchSidebar onSearch={handleSearch} loading={loading} />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {!hasSearched && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <p className="text-base font-medium text-slate-600">
                Select states and keywords, then run a search
              </p>
              <p className="mt-1 text-sm">Results will appear here as cards.</p>
            </div>
          )}

          {hasSearched && loading && (
            <div className="flex h-full items-center justify-center text-slate-500">
              Searching for today&apos;s articles…
            </div>
          )}

          {hasSearched && !loading && results && results.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <p className="text-base font-medium text-slate-600">No articles found</p>
              <p className="mt-1 text-sm">Try a different state or widen the date window.</p>
            </div>
          )}

          {hasSearched && !loading && results && results.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {results.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
