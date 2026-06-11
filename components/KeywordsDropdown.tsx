"use client";

import { useEffect, useRef, useState } from "react";

interface KeywordsDropdownProps {
  options: string[];
  selected: string[];
  custom: string[];
  onToggle: (keyword: string) => void;
  onAddCustom: (keyword: string) => void;
  onRemoveCustom: (keyword: string) => void;
}

export default function KeywordsDropdown({
  options,
  selected,
  custom,
  onToggle,
  onAddCustom,
  onRemoveCustom,
}: KeywordsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitDraft() {
    const trimmed = draft.trim();
    if (!trimmed || custom.includes(trimmed)) return;
    onAddCustom(trimmed);
    setDraft("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium font-mono transition-colors ${
          open
            ? "border-blue bg-blue-soft text-ink"
            : "border-line-strong bg-surface-2 text-ink-2 hover:border-line-strong hover:text-ink"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11L15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>{selected.length} {selected.length === 1 ? "term" : "terms"}</span>
        <span className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-72 overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <div className="border-b border-line px-3 py-2">
            <Kicker>Keywords</Kicker>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {options.map((keyword) => (
              <label
                key={keyword}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(keyword)}
                  onChange={() => onToggle(keyword)}
                  className="size-3.5 accent-blue"
                />
                {keyword}
              </label>
            ))}
            {custom.map((keyword) => (
              <div
                key={keyword}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2"
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(keyword)}
                    onChange={() => onToggle(keyword)}
                    className="size-3.5 accent-blue"
                  />
                  {keyword}
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveCustom(keyword)}
                  className="text-ink-3 hover:text-ink-2"
                  aria-label={`Remove ${keyword}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-line p-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitDraft();
                }
              }}
              placeholder="Add custom term…"
              className="min-w-0 flex-1 rounded-md border border-line-strong bg-surface-2 px-2 py-1.5 text-sm text-ink placeholder:text-ink-3 focus:border-blue focus:outline-none focus:ring-3 focus:ring-blue/20"
            />
            <button
              type="button"
              onClick={submitDraft}
              className="rounded-md border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink-2 transition-colors hover:border-blue hover:text-ink"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-mono text-ink-3">{children}</p>;
}
