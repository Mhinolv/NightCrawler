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

function isFatal(casualties?: string): boolean {
  return !!casualties && /\bfatal/i.test(casualties) && !/no fatal/i.test(casualties);
}

export default function ArticleCard({ article }: { article: Article }) {
  const fatal = isFatal(article.casualties);

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold leading-snug text-slate-900 hover:text-blue-700 hover:underline"
        >
          {article.headline}
        </a>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {article.state}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-600">{article.source}</span>
        <span aria-hidden>·</span>
        <span>{timeAgo(article.publishedAt)}</span>
      </div>

      {article.summary && (
        <p className="text-sm leading-relaxed text-slate-700">{article.summary}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {article.location && (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {article.location}
          </span>
        )}
        {article.vehicleType && (
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
            {VEHICLE_LABELS[article.vehicleType] ?? article.vehicleType}
          </span>
        )}
        {article.casualties && (
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
              fatal ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {article.casualties}
          </span>
        )}
      </div>
    </article>
  );
}
