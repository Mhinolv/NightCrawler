import { severityRank } from "./casualties";
import { SortValue } from "./config";
import { Article } from "./types";

export const SORT_COMPARATORS: Record<SortValue, (a: Article, b: Article) => number> = {
  oldest: (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  severity: (a, b) => {
    const rankDiff = severityRank(a.casualties) - severityRank(b.casualties);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  },
  newest: (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
};
