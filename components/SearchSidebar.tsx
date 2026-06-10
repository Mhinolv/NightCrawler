"use client";

import { useState } from "react";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_PROVIDER,
  DEFAULT_RESULT_LIMIT,
  PROVIDER_OPTIONS,
  ProviderValue,
  RESULT_LIMITS,
  SORT_OPTIONS,
  SortValue,
  TIME_WINDOWS,
  US_STATES,
} from "@/lib/config";
import StateDropdown from "./StateDropdown";

export interface SearchParams {
  states: string[];
  keywords: string[];
  window: string;
  sort: SortValue;
  limit: number;
  provider: ProviderValue;
}

interface SearchSidebarProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-mono text-ink-3">{children}</p>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-surface"
          : "border-line-strong bg-surface text-ink-2 hover:border-coral-line hover:text-coral-deep"
      }`}
    >
      {children}
    </button>
  );
}

export default function SearchSidebar({ onSearch, loading }: SearchSidebarProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>(["TX"]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([...DEFAULT_KEYWORDS]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [window, setWindow] = useState(TIME_WINDOWS[0].value);
  const [sort, setSort] = useState<SortValue>(SORT_OPTIONS[0].value);
  const [limit, setLimit] = useState(DEFAULT_RESULT_LIMIT);
  const [provider, setProvider] = useState<ProviderValue>(DEFAULT_PROVIDER);

  function toggleKeyword(keyword: string) {
    setSelectedKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  }

  function addCustomKeyword() {
    const trimmed = customKeyword.trim();
    if (!trimmed || customKeywords.includes(trimmed)) return;
    setCustomKeywords((prev) => [...prev, trimmed]);
    setSelectedKeywords((prev) => [...prev, trimmed]);
    setCustomKeyword("");
  }

  function removeCustomKeyword(keyword: string) {
    setCustomKeywords((prev) => prev.filter((k) => k !== keyword));
    setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
  }

  function handleSubmit() {
    onSearch({ states: selectedStates, keywords: selectedKeywords, window, sort, limit, provider });
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-6 py-6">
      <div>
        <Kicker>States</Kicker>
        <div className="mt-3">
          <StateDropdown states={US_STATES} selected={selectedStates} onChange={setSelectedStates} />
        </div>
      </div>

      <div>
        <Kicker>Keywords</Kicker>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DEFAULT_KEYWORDS.map((keyword) => (
            <Chip
              key={keyword}
              active={selectedKeywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword)}
            >
              {keyword}
            </Chip>
          ))}

          {customKeywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1.5 text-sm font-medium text-surface"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeCustomKeyword(keyword)}
                className="text-surface/70 hover:text-surface"
                aria-label={`Remove ${keyword}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomKeyword();
              }
            }}
            placeholder="Add custom term…"
            className="min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-coral focus:outline-none focus:ring-3 focus:ring-coral/20"
          />
          <button
            type="button"
            onClick={addCustomKeyword}
            className="rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:border-coral-line hover:text-coral-deep"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <Kicker>Date window</Kicker>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TIME_WINDOWS.map((option) => (
            <Chip
              key={option.value}
              active={window === option.value}
              onClick={() => setWindow(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Kicker>Sort by</Kicker>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((option) => (
            <Chip key={option.value} active={sort === option.value} onClick={() => setSort(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Kicker>Result limit</Kicker>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {RESULT_LIMITS.map((option) => (
            <Chip key={option.value} active={limit === option.value} onClick={() => setLimit(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Kicker>Search method</Kicker>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PROVIDER_OPTIONS.map((option) => (
            <Chip key={option.value} active={provider === option.value} onClick={() => setProvider(option.value)}>
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || selectedStates.length === 0 || selectedKeywords.length === 0}
        className="mt-auto rounded-full bg-coral px-5 py-3 text-sm font-semibold text-surface shadow-[0_8px_20px_rgba(214,87,58,0.24)] transition-colors hover:bg-coral-deep disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-4 disabled:shadow-none"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </aside>
  );
}
