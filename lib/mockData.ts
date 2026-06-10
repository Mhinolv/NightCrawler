import { Article } from "./types";

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    headline: "18-wheeler overturns on I-35, blocking northbound lanes for hours",
    url: "https://example.com/articles/i35-overturn",
    source: "Austin Statesman",
    publishedAt: hoursAgo(2),
    state: "TX",
    location: "I-35 near Round Rock, TX",
    vehicleType: "18-wheeler",
    casualties: "1 injury reported, no fatalities",
    summary:
      "A semi-truck hauling lumber rolled onto its side after swerving to avoid stalled traffic, spilling cargo across all northbound lanes.",
  },
  {
    id: "2",
    headline: "Delivery driver injured after box truck collides with utility pole",
    url: "https://example.com/articles/box-truck-pole",
    source: "Houston Chronicle",
    publishedAt: hoursAgo(5),
    state: "TX",
    location: "Westheimer Rd, Houston, TX",
    vehicleType: "service vehicle",
    casualties: "1 injury reported",
    summary:
      "The driver of a delivery van lost control during heavy rain and struck a utility pole, knocking out power to nearby businesses.",
  },
  {
    id: "3",
    headline: "Fatal crash involving tractor-trailer closes Highway 290 for investigation",
    url: "https://example.com/articles/hwy290-fatal",
    source: "KHOU 11",
    publishedAt: hoursAgo(9),
    state: "TX",
    location: "Highway 290, Waller County, TX",
    vehicleType: "18-wheeler",
    casualties: "1 fatality confirmed",
    summary:
      "Authorities say a tractor-trailer crossed the median and collided head-on with a passenger vehicle during early morning hours.",
  },
  {
    id: "4",
    headline: "Garbage truck driver hospitalized after rollover in residential area",
    url: "https://example.com/articles/garbage-truck-rollover",
    source: "Los Angeles Times",
    publishedAt: hoursAgo(3),
    state: "CA",
    location: "Reseda, Los Angeles, CA",
    vehicleType: "service vehicle",
    casualties: "1 injury reported, driver hospitalized",
    summary:
      "A city sanitation truck rolled onto its side while turning onto a residential street, with no other vehicles involved.",
  },
  {
    id: "5",
    headline: "Multi-vehicle pileup on I-5 involves semi-truck, several injuries reported",
    url: "https://example.com/articles/i5-pileup",
    source: "San Diego Union-Tribune",
    publishedAt: hoursAgo(14),
    state: "CA",
    location: "I-5 near Carlsbad, CA",
    vehicleType: "18-wheeler",
    casualties: "4 injuries reported, no fatalities",
    summary:
      "Dense fog is believed to be a factor in a chain-reaction crash involving a semi-truck and five passenger vehicles during the morning commute.",
  },
  {
    id: "6",
    headline: "Tow truck operator struck while assisting stranded motorist on shoulder",
    url: "https://example.com/articles/tow-truck-struck",
    source: "Sacramento Bee",
    publishedAt: hoursAgo(20),
    state: "CA",
    location: "Highway 99, Sacramento, CA",
    vehicleType: "service vehicle",
    casualties: "1 fatality confirmed",
    summary:
      "A tow truck operator was struck and killed by a passing vehicle while hooking up a disabled car on the shoulder of Highway 99.",
  },
  {
    id: "7",
    headline: "Cement mixer truck crash spills debris across intersection",
    url: "https://example.com/articles/cement-mixer-crash",
    source: "Tampa Bay Times",
    publishedAt: hoursAgo(6),
    state: "FL",
    location: "Dale Mabry Hwy, Tampa, FL",
    vehicleType: "truck",
    casualties: "No injuries reported",
    summary:
      "A concrete mixer truck collided with a sedan at a busy intersection, spilling wet concrete and causing significant traffic delays.",
  },
  {
    id: "8",
    headline: "Two semis collide on I-95, southbound lanes shut down overnight",
    url: "https://example.com/articles/i95-semi-collision",
    source: "Florida Times-Union",
    publishedAt: hoursAgo(11),
    state: "FL",
    location: "I-95 near Jacksonville, FL",
    vehicleType: "18-wheeler",
    casualties: "1 injury reported",
    summary:
      "Two tractor-trailers collided in the southbound lanes overnight, with one catching fire. Cleanup crews worked through the night.",
  },
];
