/**
 * Quick eval for the extraction prompt against a fixed set of mock articles.
 * Run with: npx tsx scripts/eval-extract.ts
 */
import { extractArticleDetails, ExtractionInput } from "../lib/extract";

interface Case extends ExtractionInput {
  expectedRelevant: boolean;
  note: string;
}

const CASES: Case[] = [
  {
    id: "fatal-18-wheeler",
    title: "Driver killed after 18-wheeler overturns on I-35 near Round Rock",
    source: "KXAN",
    snippet: "One person died Tuesday when a tractor-trailer rolled over on I-35, blocking traffic for hours.",
    expectedRelevant: true,
    note: "clear 18-wheeler fatality",
  },
  {
    id: "truck-driver-injury",
    title: "Truck driver hospitalized after collision with pickup on Highway 6",
    source: "KBTX",
    snippet: "A semi-truck driver suffered non-life-threatening injuries Monday in a crash with a pickup truck.",
    expectedRelevant: true,
    note: "semi-truck driver injury",
  },
  {
    id: "garbage-truck",
    title: "City garbage truck strikes parked car in downtown Austin",
    source: "Austin Monitor",
    snippet: "No injuries were reported after a city sanitation truck collided with a parked vehicle Wednesday morning.",
    expectedRelevant: true,
    note: "service vehicle (garbage truck), no injuries",
  },
  {
    id: "delivery-van",
    title: "Amazon delivery van crashes into utility pole, driver injured",
    source: "Local News 8",
    snippet: "An Amazon delivery driver was taken to the hospital after losing control and striking a utility pole.",
    expectedRelevant: true,
    note: "service vehicle (delivery van), injury",
  },
  {
    id: "tow-truck",
    title: "Tow truck overturns on icy overpass, no injuries reported",
    source: "WFAA",
    snippet: "A tow truck flipped on its side on the Highway 71 overpass during this morning's ice storm. No injuries were reported.",
    expectedRelevant: true,
    note: "service vehicle (tow truck), no injuries",
  },
  {
    id: "fruit-vendor",
    title: "Friends of Utah fruit vendor start GoFundMe after he loses fruit in crash",
    source: "AOL.com",
    snippet: undefined,
    expectedRelevant: false,
    note: "real case from prod — too vague, no vehicle type stated",
  },
  {
    id: "lawyer-ad",
    title: "Injured in a truck accident? Call our 18-wheeler accident lawyers today",
    source: "Sponsored",
    snippet: "Our attorneys have recovered millions of dollars for victims of truck accidents. Free consultation.",
    expectedRelevant: false,
    note: "lawyer ad",
  },
  {
    id: "metaphor",
    title: "Local economy trucking along despite inflation fears",
    source: "Business Journal",
    snippet: "Business leaders say the regional economy continues trucking along into the new year.",
    expectedRelevant: false,
    note: "metaphorical use of 'trucking'",
  },
  {
    id: "two-cars",
    title: "Two killed in head-on collision between two sedans on Route 9",
    source: "Patch",
    snippet: "Police say both drivers died at the scene after a head-on crash involving two passenger cars.",
    expectedRelevant: false,
    note: "cars only, no truck/service vehicle",
  },
  {
    id: "school-bus",
    title: "School bus involved in minor fender-bender, no injuries",
    source: "Patch",
    snippet: "A school bus carrying students was involved in a minor collision Tuesday. No injuries were reported.",
    expectedRelevant: false,
    note: "school bus is not a qualifying vehicle type",
  },
];

async function main() {
  const results = await extractArticleDetails(
    CASES.map(({ id, title, source, snippet }) => ({ id, title, source, snippet }))
  );
  const byId = new Map(results.map((r) => [r.id, r]));

  let pass = 0;
  for (const c of CASES) {
    const r = byId.get(c.id);
    const ok = r?.relevant === c.expectedRelevant;
    if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.id} (${c.note})`);
    console.log(`  expected relevant=${c.expectedRelevant}`);
    console.log(`  got      relevant=${r?.relevant}`, JSON.stringify({
      location: r?.location,
      vehicleType: r?.vehicleType,
      casualties: r?.casualties,
      summary: r?.summary,
    }));
  }
  console.log(`\n${pass}/${CASES.length} passed`);
}

main();
