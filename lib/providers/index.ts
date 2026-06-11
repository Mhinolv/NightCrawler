import { fetchFromBingRss } from "./bingNewsRss";
import { fetchFromGdelt } from "./gdelt";
import { fetchFromGoogleNewsRss } from "./googleNewsRss";
import { FetchArticlesParams, NewsProvider, RawArticle } from "./types";

export * from "./types";

/** Fetches articles via the user-selected provider: Google News RSS, Bing News RSS, or GDELT (all free). */
export async function fetchArticles(
  params: FetchArticlesParams,
  provider: NewsProvider
): Promise<RawArticle[]> {
  if (provider === "bing") {
    return fetchFromBingRss(params);
  }
  if (provider === "gdelt") {
    return fetchFromGdelt(params);
  }
  return fetchFromGoogleNewsRss(params);
}
