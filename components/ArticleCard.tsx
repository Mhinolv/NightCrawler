import { getSeverity } from "@/lib/casualties";
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
  other: "Vehicle",
};

export default function ArticleCard({ article }: { article: Article }) {
  const severity = getSeverity(article.casualties);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-soft-sm transition-shadow hover:shadow-soft-md sm:p-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-mono text-ink-3">
        <span className="font-medium text-ink-2">{article.source}</span>
        <span aria-hidden>·</span>
        <span>{timeAgo(article.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span>{article.state}</span>
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-serif text-xl leading-snug text-ink decoration-coral decoration-2 underline-offset-4 hover:text-coral-deep hover:underline"
      >
        {article.headline}
      </a>

      {article.summary && (
        <p className="text-sm leading-relaxed text-ink-2">{article.summary}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {article.location && (
          <span className="inline-flex items-center rounded-full bg-paper-2 px-3 py-1 text-xs font-medium text-ink-2">
            {article.location}
          </span>
        )}
        {article.vehicleType && (
          <span className="inline-flex items-center rounded-full bg-teal-soft px-3 py-1 text-xs font-medium text-teal-deep">
            {VEHICLE_LABELS[article.vehicleType] ?? article.vehicleType}
          </span>
        )}
        {article.casualties && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              severity === "fatal"
                ? "bg-danger-soft text-danger"
                : severity === "clear"
                  ? "bg-positive-soft text-positive"
                  : "bg-gold-soft text-gold"
            }`}
          >
            {article.casualties}
          </span>
        )}
      </div>
    </article>
  );
}
