"use client";

import {
  DEFAULT_KEYWORDS,
  PROVIDER_OPTIONS,
  ProviderValue,
  SEVERITY_OPTIONS,
  SeverityFilter,
  SORT_OPTIONS,
  SortValue,
  TIME_WINDOWS,
  US_STATES,
} from "@/lib/config";
import KeywordsDropdown from "./KeywordsDropdown";
import StateDropdown from "./StateDropdown";

interface FilterBarProps {
  states: string[];
  onStatesChange: (states: string[]) => void;
  keywords: string[];
  onKeywordsToggle: (keyword: string) => void;
  customKeywords: string[];
  onAddCustomKeyword: (keyword: string) => void;
  onRemoveCustomKeyword: (keyword: string) => void;
  window: string;
  onWindowChange: (window: string) => void;
  severityFilter: SeverityFilter[];
  onSeverityFilterChange: (severities: SeverityFilter[]) => void;
  sort: SortValue;
  onSortChange: (sort: SortValue) => void;
  provider: ProviderValue;
  onProviderChange: (provider: ProviderValue) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-mono text-ink-3">{children}</p>;
}

function ToggleButton({
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
      className={`rounded-md border px-3 py-1.5 text-sm font-medium font-mono transition-colors ${
        active
          ? "border-blue bg-blue text-surface"
          : "border-line-strong bg-surface-2 text-ink-2 hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

const SEVERITY_DOT: Record<SeverityFilter, string> = {
  fatal: "bg-coral",
  injury: "bg-gold",
  clear: "bg-blue",
};

const SEVERITY_ACTIVE_CLASS: Record<SeverityFilter, string> = {
  fatal: "border-coral-line bg-coral-soft text-coral",
  injury: "border-gold/30 bg-gold-soft text-gold",
  clear: "border-blue/30 bg-blue-soft text-blue",
};

function SeverityToggle({
  option,
  active,
  onClick,
}: {
  option: SeverityFilter;
  active: boolean;
  onClick: () => void;
}) {
  const label = SEVERITY_OPTIONS.find((o) => o.value === option)?.label ?? option;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium font-mono transition-colors ${
        active ? SEVERITY_ACTIVE_CLASS[option] : "border-line-strong bg-surface-2 text-ink-2 hover:text-ink"
      }`}
    >
      <span className={`size-1.5 rounded-full ${SEVERITY_DOT[option]}`} aria-hidden />
      {label}
    </button>
  );
}

export default function FilterBar({
  states,
  onStatesChange,
  keywords,
  onKeywordsToggle,
  customKeywords,
  onAddCustomKeyword,
  onRemoveCustomKeyword,
  window,
  onWindowChange,
  severityFilter,
  onSeverityFilterChange,
  sort,
  onSortChange,
  provider,
  onProviderChange,
}: FilterBarProps) {
  function toggleSeverity(option: SeverityFilter) {
    onSeverityFilterChange(
      severityFilter.includes(option)
        ? severityFilter.filter((s) => s !== option)
        : [...severityFilter, option]
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-line bg-surface px-6 py-3">
      <div className="flex flex-col gap-1.5">
        <Label>States</Label>
        <StateDropdown states={US_STATES} selected={states} onChange={onStatesChange} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Keywords</Label>
        <KeywordsDropdown
          options={DEFAULT_KEYWORDS}
          selected={keywords}
          custom={customKeywords}
          onToggle={onKeywordsToggle}
          onAddCustom={onAddCustomKeyword}
          onRemoveCustom={onRemoveCustomKeyword}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Window</Label>
        <div className="flex gap-1.5">
          {TIME_WINDOWS.map((option) => (
            <ToggleButton key={option.value} active={window === option.value} onClick={() => onWindowChange(option.value)}>
              {option.short}
            </ToggleButton>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Severity</Label>
        <div className="flex gap-1.5">
          {SEVERITY_OPTIONS.map((option) => (
            <SeverityToggle
              key={option.value}
              option={option.value}
              active={severityFilter.includes(option.value)}
              onClick={() => toggleSeverity(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Sort</Label>
        <div className="flex gap-1.5">
          {SORT_OPTIONS.map((option) => (
            <ToggleButton key={option.value} active={sort === option.value} onClick={() => onSortChange(option.value)}>
              {option.short}
            </ToggleButton>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Method</Label>
        <div className="flex gap-1.5">
          {PROVIDER_OPTIONS.map((option) => (
            <ToggleButton key={option.value} active={provider === option.value} onClick={() => onProviderChange(option.value)}>
              {option.short}
            </ToggleButton>
          ))}
        </div>
      </div>
    </div>
  );
}
