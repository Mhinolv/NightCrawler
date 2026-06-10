import Anthropic from "@anthropic-ai/sdk";
import { VehicleType } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

const VEHICLE_TYPES: VehicleType[] = ["18-wheeler", "truck", "service vehicle", "other"];

export interface ExtractionInput {
  id: string;
  title: string;
  source: string;
  snippet?: string;
}

export interface ExtractionResult {
  id: string;
  relevant: boolean;
  location?: string;
  vehicleType?: VehicleType;
  casualties?: string;
  summary?: string;
}

const EXTRACT_TOOL = {
  name: "extract_articles",
  description:
    "Record relevance and structured details for each news article about a vehicle accident.",
  input_schema: {
    type: "object" as const,
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The article id, copied from the input.",
            },
            relevant: {
              type: "boolean",
              description:
                "True only if the article is about a real accident/crash involving a truck driver, 18-wheeler/tractor-trailer, or service vehicle (delivery van, tow truck, garbage truck, utility truck, etc). False for lawyer/attorney ads, unrelated stories, or metaphorical uses (e.g. 'trucking along').",
            },
            location: {
              type: "string",
              description:
                "Short location of the accident, e.g. 'I-35 near Round Rock, TX'. Omit this field entirely if the location can't be determined from the title/snippet.",
            },
            vehicleType: {
              type: "string",
              enum: VEHICLE_TYPES,
              description: "The primary vehicle type involved in the accident.",
            },
            casualties: {
              type: "string",
              description:
                "Short description of injuries/fatalities, e.g. '1 fatality confirmed' or 'No injuries reported'.",
            },
            summary: {
              type: "string",
              description: "One or two sentence summary of what happened.",
            },
          },
          required: ["id", "relevant"],
        },
      },
    },
    required: ["results"],
  },
};

function buildPrompt(articles: ExtractionInput[]): string {
  const items = articles
    .map(
      (a) =>
        `- id: ${a.id}\n  source: ${a.source}\n  title: ${a.title}\n  snippet: ${a.snippet ?? "(none)"}`
    )
    .join("\n");

  return `Below is a list of news articles found via a search for accidents involving truck drivers, 18-wheelers, and service vehicles.

For each article, determine whether it is actually about such an accident (not a lawyer ad, unrelated story, or metaphorical use), and if so extract the location, vehicle type, casualties, and a short summary based on the title and snippet provided.

Articles:
${items}

Call extract_articles with one result per article, in the same order, using the same ids.`;
}

/**
 * Sends deduped articles to Claude in a single batched call to filter
 * irrelevant results and extract structured details.
 */
export async function extractArticleDetails(
  articles: ExtractionInput[]
): Promise<ExtractionResult[]> {
  if (articles.length === 0) return [];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "extract_articles" },
    messages: [{ role: "user", content: buildPrompt(articles) }],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return [];

  const input = toolUse.input as { results?: ExtractionResult[] };
  return input.results ?? [];
}
