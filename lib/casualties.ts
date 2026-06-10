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
