import { getSeverity, getSeverityLabel, getVictimCount } from "@/lib/casualties";
import { Article } from "@/lib/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

const VEHICLE_LABELS: Record<string, string> = {
  "18-wheeler": "18-Wheeler",
  truck: "Truck",
  "service vehicle": "Service Vehicle",
  other: "Other",
};

const SEVERITY_ROW_BORDER: Record<string, string> = {
  fatal: "border-l-coral",
  injury: "border-l-gold",
  clear: "border-l-blue",
  unknown: "border-l-line-strong",
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  fatal: "bg-coral-soft text-coral",
  injury: "bg-gold-soft text-gold",
  clear: "bg-blue-soft text-blue",
  unknown: "bg-surface-2 text-ink-3",
};

const SEVERITY_DOT_CLASS: Record<string, string> = {
  fatal: "bg-coral",
  injury: "bg-gold",
  clear: "bg-blue",
  unknown: "bg-ink-4",
};

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <rect x="1" y="4" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 6h3l2 2v2h-5V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="4" cy="12" r="1.3" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="1.3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M2 10v-2l1.5-3.5h9L14 8v2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="1.5" y="9.5" width="13" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.5" cy="12.5" r="1.1" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="11.5" cy="12.5" r="1.1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="8" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 14c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ArticleRow({ article }: { article: Article }) {
  const severity = getSeverity(article.casualties);
  const victims = getVictimCount(article.casualties);
  const vehicleLabel = article.vehicleType ? VEHICLE_LABELS[article.vehicleType] ?? article.vehicleType : null;
  const VehicleIcon = article.vehicleType === "other" ? CarIcon : TruckIcon;

  const detailParts = [article.location, article.summary].filter(Boolean);

  return (
    <tr className={`border-b border-l-2 border-line ${SEVERITY_ROW_BORDER[severity]} hover:bg-surface-2`}>
      <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-xs text-ink-2">
        {timeAgo(article.publishedAt)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-xs uppercase tracking-mono text-ink-2">
        {article.source}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-xs text-ink-2">{article.state}</td>
      <td className="max-w-xl px-4 py-3 align-top">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate font-semibold text-ink hover:text-coral hover:underline"
        >
          {article.headline}
        </a>
        {detailParts.length > 0 && (
          <p className="mt-0.5 truncate text-sm text-ink-3">{detailParts.join(" · ")}</p>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top">
        {vehicleLabel && (
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
            <VehicleIcon />
            {vehicleLabel}
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-2">
          <PersonIcon />
          {victims ?? "—"}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-mono ${SEVERITY_BADGE_CLASS[severity]}`}
        >
          <span className={`size-1.5 rounded-full ${SEVERITY_DOT_CLASS[severity]}`} aria-hidden />
          {getSeverityLabel(severity)}
        </span>
      </td>
    </tr>
  );
}

export default function ResultsTable({ articles }: { articles: Article[] }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-line">
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">Time</th>
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">Source</th>
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">St</th>
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">Headline</th>
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">Vehicle</th>
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">Victims</th>
          <th className="px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-mono text-ink-3">Severity</th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
      </tbody>
    </table>
  );
}
