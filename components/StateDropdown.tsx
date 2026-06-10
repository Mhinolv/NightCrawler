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

  const label =
    selected.length === 0
      ? "Select states…"
      : selected.length === 1
        ? states.find((s) => s.code === selected[0])?.name ?? selected[0]
        : `${selected.length} states selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-line-strong bg-surface px-3 py-2 text-left text-sm text-ink transition-colors focus:border-coral focus:outline-none focus:ring-3 focus:ring-coral/20"
      >
        <span className={selected.length === 0 ? "text-ink-3" : "text-ink"}>{label}</span>
        <span className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <Kicker>States</Kicker>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange(states.map((s) => s.code))}
                className="text-xs font-semibold text-coral-deep hover:underline"
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
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-paper-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(state.code)}
                  onChange={() => toggleState(state.code)}
                  className="size-3.5 accent-coral"
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
