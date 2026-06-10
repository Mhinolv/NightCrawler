"use client";

import { useState } from "react";
import { DEFAULT_KEYWORDS, TIME_WINDOWS, US_STATES } from "@/lib/config";

export interface SearchParams {
  states: string[];
  keywords: string[];
  window: string;
}

interface SearchSidebarProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export default function SearchSidebar({ onSearch, loading }: SearchSidebarProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>(["TX"]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([...DEFAULT_KEYWORDS]);
  const [customKeyword, setCustomKeyword] = useState("");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [window, setWindow] = useState(TIME_WINDOWS[0].value);

  function toggleState(code: string) {
    setSelectedStates((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  }

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
    onSearch({ states: selectedStates, keywords: selectedKeywords, window });
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          States
        </h2>
        <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-slate-200 p-2">
          <div className="grid grid-cols-2 gap-1">
            {US_STATES.map((state) => {
              const checked = selectedStates.includes(state.code);
              return (
                <label
                  key={state.code}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors ${
                    checked ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-blue-600"
                    checked={checked}
                    onChange={() => toggleState(state.code)}
                  />
                  {state.code}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Keywords
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {DEFAULT_KEYWORDS.map((keyword) => {
            const checked = selectedKeywords.includes(keyword);
            return (
              <label
                key={keyword}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  checked
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-blue-600"
                  checked={checked}
                  onChange={() => toggleKeyword(keyword)}
                />
                {keyword}
              </label>
            );
          })}

          {customKeywords.map((keyword) => (
            <div
              key={keyword}
              className="flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700"
            >
              <span className="truncate">{keyword}</span>
              <button
                type="button"
                onClick={() => removeCustomKeyword(keyword)}
                className="text-blue-400 hover:text-blue-700"
                aria-label={`Remove ${keyword}`}
              >
                ×
              </button>
            </div>
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
            className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={addCustomKeyword}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Date window
        </h2>
        <div className="mt-3 flex flex-col gap-2">
          {TIME_WINDOWS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                window === option.value
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="window"
                className="h-3.5 w-3.5 accent-blue-600"
                checked={window === option.value}
                onChange={() => setWindow(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || selectedStates.length === 0 || selectedKeywords.length === 0}
        className="mt-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </aside>
  );
}
