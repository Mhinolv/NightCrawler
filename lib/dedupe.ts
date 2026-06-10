import { RawArticle } from "./providers/types";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Removes duplicate articles by normalized title, keeping the first
 * occurrence (earliest in the input order).
 */
export function dedupeArticles<T extends RawArticle>(articles: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const article of articles) {
    const key = normalizeTitle(article.title);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(article);
  }

  return result;
}
