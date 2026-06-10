import { fetchFromGoogleNewsRss } from "./googleNewsRss";
import { fetchFromSerpApi } from "./serpapi";
import { FetchArticlesParams, RawArticle } from "./types";

export * from "./types";

/**
 * Fetches articles via Google News RSS (free, default), falling back to
 * SerpAPI when RSS fails and a key is configured. Set NEWS_PROVIDER=serpapi
 * to bypass RSS entirely.
 */
export async function fetchArticles(params: FetchArticlesParams): Promise<RawArticle[]> {
  if (process.env.NEWS_PROVIDER === "serpapi") {
    return fetchFromSerpApi(params);
  }

  try {
    return await fetchFromGoogleNewsRss(params);
  } catch (err) {
    if (process.env.SERP_API_KEY) {
      console.error("Google News RSS failed, falling back to SerpAPI:", err);
      return fetchFromSerpApi(params);
    }
    throw err;
  }
}
