"use client";

import { useEffect, useRef, useState } from "react";
import { StateOption } from "@/lib/config";

interface StateDropdownProps {
  states: StateOption[];
  selected: string[];
  onChange: (codes: string[]) => void;
}

export default function StateDropdown({ states, selected, onChange }: StateDropdownProps) {
  const [open, setOpen] = useState(false);
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

  function toggleState(code: string) {
    onChange(selected.includes(code) ? selected.filter((s) => s !== code) : [...selected, code]);
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
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <span>{selected.length}</span>
        <span className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-56 overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <Kicker>States</Kicker>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange(states.map((s) => s.code))}
                className="text-xs font-semibold text-blue hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-semibold text-ink-3 hover:text-ink-2 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {states.map((state) => (
              <label
                key={state.code}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(state.code)}
                  onChange={() => toggleState(state.code)}
                  className="size-3.5 accent-blue"
                />
                {state.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-mono text-ink-3">{children}</p>;
}
