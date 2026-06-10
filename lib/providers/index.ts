import { fetchFromGoogleNewsRss } from "./googleNewsRss";
import { fetchFromSerpApi } from "./serpapi";
import { FetchArticlesParams, NewsProvider, RawArticle } from "./types";

export * from "./types";

/** Fetches articles via the user-selected provider: Google News RSS (free) or SerpAPI. */
export async function fetchArticles(
  params: FetchArticlesParams,
  provider: NewsProvider
): Promise<RawArticle[]> {
  if (provider === "serpapi") {
    return fetchFromSerpApi(params);
  }
  return fetchFromGoogleNewsRss(params);
}
