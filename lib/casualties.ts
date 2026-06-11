export type Severity = "fatal" | "injury" | "clear" | "unknown";

/** Buckets a free-text casualties description into a severity level. */
export function getSeverity(casualties?: string): Severity {
  if (!casualties) return "unknown";
  const isFatal = /\bfatal/i.test(casualties) && !/no fatal/i.test(casualties);
  if (isFatal) return "fatal";
  if (/no injur/i.test(casualties)) return "clear";
  return "injury";
}

const SEVERITY_RANK: Record<Severity, number> = {
  fatal: 0,
  injury: 1,
  unknown: 2,
  clear: 3,
};

/** Lower rank = more severe. Used for "most severe first" sorting. */
export function severityRank(casualties?: string): number {
  return SEVERITY_RANK[getSeverity(casualties)];
}

const SEVERITY_LABELS: Record<Severity, string> = {
  fatal: "Fatal",
  injury: "Injury",
  clear: "Property",
  unknown: "Unknown",
};

/** Display label for a severity bucket (e.g. for filter chips and badges). */
export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity];
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

/** Sums all numeric/word-form quantities mentioned in a casualties description. */
export function getVictimCount(casualties?: string): number | null {
  if (!casualties) return null;
  if (/no injur/i.test(casualties) && !/\d/.test(casualties)) return 0;

  const matches = casualties.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi);
  if (!matches) return /no injur/i.test(casualties) ? 0 : null;

  return matches.reduce((sum, match) => {
    const num = /^\d+$/.test(match) ? Number(match) : NUMBER_WORDS[match.toLowerCase()];
    return sum + (num ?? 0);
  }, 0);
}
