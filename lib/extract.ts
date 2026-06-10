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
                "True only if the title/snippet explicitly indicates a real accident/crash involving a truck driver, 18-wheeler/tractor-trailer, or service vehicle (delivery van, tow truck, garbage truck, utility truck, etc). " +
                "False for lawyer/attorney ads, unrelated stories, metaphorical uses (e.g. 'trucking along'), accidents involving only cars/pedestrians/other non-qualifying vehicles, or articles too vague to confirm a qualifying vehicle was involved. " +
                "When in doubt, mark false rather than guessing.",
            },
            location: {
              type: "string",
              description:
                "Short location of the accident, e.g. 'I-35 near Round Rock, TX'. Only include if the location is explicitly stated in the title/snippet. Omit this field entirely otherwise.",
            },
            vehicleType: {
              type: "string",
              enum: VEHICLE_TYPES,
              description:
                "The primary vehicle type involved, only if explicitly stated or clearly implied by the title/snippet (e.g. 'semi', 'tractor-trailer' -> 18-wheeler; 'garbage truck', 'delivery van', 'tow truck' -> service vehicle). Do not guess based on unrelated context (e.g. a person's occupation). Omit this field if unclear.",
            },
            casualties: {
              type: "string",
              description:
                "Short description of injuries/fatalities, e.g. '1 fatality confirmed' or 'No injuries reported'. Only include if the title/snippet explicitly states this. Omit this field if not mentioned.",
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

For each article, determine whether the title/snippet explicitly indicates a real accident or crash involving a truck driver, 18-wheeler/tractor-trailer, or service vehicle (delivery van, tow truck, garbage truck, utility truck, etc).

Mark an article relevant=false if:
- It's a lawyer/attorney ad
- It's an unrelated story or uses "truck"/"crash" metaphorically
- The accident only involves cars, pedestrians, or other non-qualifying vehicles
- The title/snippet is too vague to confirm a qualifying vehicle was actually involved in a crash

Do not infer details (vehicle type, location, casualties) from context that isn't stated — e.g. don't assume someone drives a truck because of their job title. If a field can't be confirmed from the text, omit it.

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
