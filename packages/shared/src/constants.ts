// Impact Tracker — Shared Constants
import type { Sector, SDGGoal } from "./types.js";

export const SECTORS: Sector[] = [
  "Health", "Education", "Climate", "Humanitarian",
  "Civic Tech", "Accessibility", "General Tech",
];

export const SECTOR_COLORS: Record<Sector, string> = {
  Health: "#16a34a", Education: "#2563eb", Climate: "#059669",
  Humanitarian: "#dc2626", "Civic Tech": "#7c3aed",
  Accessibility: "#ea580c", "General Tech": "#6b7280",
};

export const SDG_GOAL_NAMES: Record<SDGGoal, string> = {
  1: "No Poverty", 2: "Zero Hunger", 3: "Good Health & Well-Being",
  4: "Quality Education", 5: "Gender Equality", 6: "Clean Water & Sanitation",
  7: "Affordable & Clean Energy", 8: "Decent Work & Economic Growth",
  9: "Industry, Innovation & Infrastructure", 10: "Reduced Inequalities",
  11: "Sustainable Cities & Communities", 12: "Responsible Consumption & Production",
  13: "Climate Action", 14: "Life Below Water", 15: "Life on Land",
  16: "Peace, Justice & Strong Institutions", 17: "Partnerships for the Goals",
};

export const DEFAULT_SDG_WEIGHTS: Record<SDGGoal, number> = {
  1: 1.0, 2: 1.0, 3: 1.2, 4: 1.2, 5: 1.0, 6: 0.9, 7: 0.9, 8: 0.8, 9: 0.8,
  10: 1.0, 11: 0.9, 12: 0.8, 13: 1.1, 14: 0.9, 15: 0.9, 16: 1.0, 17: 0.8,
};

export const SCORE_MAX = {
  sectorRelevance: 30, contributorGeography: 25, firstTimerOnboarding: 20,
  docsAccessibility: 15, communityHealth: 10, total: 100,
} as const;

export const SCORING_THRESHOLDS = {
  minClassificationConfidence: 0.7,
  ruleBasedConfidence: 0.6,
  maxGeographyCountries: 5,
  maxFirstTimerRatio: 0.5,
  minReadmeLength: 500,
  maxIssueResponseHours: 48,
  minPRMergeRate: 0.5,
  activityWindowDays: 30,
} as const;

export const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  Health: ["health", "medical", "clinical", "hospital", "patient", "mhealth", "healthcare", "pharma", "diagnosis", "telemedicine", "ehr", "fhir"],
  Education: ["education", "learning", "school", "student", "teaching", "edtech", "mooc", "curriculum", "classroom", "lms", "elearning"],
  Climate: ["climate-change", "global-warming", "decarbonization", "sustainability-report", "renewable-energy", "solar-panel", "wind-turbine", "carbon-footprint", "ecology", "biodiversity", "conservation-effort", "net-zero"],
  Humanitarian: ["humanitarian", "refugee", "disaster", "relief", "ngo", "nonprofit", "aid", "crisis", "poverty", "donation", "charity", "philanthropy"],
  "Civic Tech": ["civic", "government", "democracy", "voting", "election", "transparency", "opendata", "policy", "legislation", "govtech", "impact", "scoring", "measurement", "social-impact"],
  Accessibility: ["accessibility", "a11y", "screen-reader", "wcag", "aria", "assistive", "disability", "inclusive-design", "captioning", "braille"],
  "General Tech": [],
};

export const SECTOR_SDG_MAP: Record<Sector, SDGGoal[]> = {
  Health: [3, 10], Education: [4, 10], Climate: [7, 13, 14, 15],
  Humanitarian: [1, 2, 10, 16], "Civic Tech": [16, 11],
  Accessibility: [10, 4], "General Tech": [9],
};

// Major City → Country Code lookup (top ~200 cities)
export const CITY_COUNTRY_MAP: Record<string, string> = {
  // South Asia
  "karachi": "PK", "lahore": "PK", "islamabad": "PK", "rawalpindi": "PK", "faisalabad": "PK", "peshawar": "PK",
  "mumbai": "IN", "delhi": "IN", "bangalore": "IN", "bengaluru": "IN", "hyderabad": "IN", "chennai": "IN",
  "kolkata": "IN", "pune": "IN", "ahmedabad": "IN", "jaipur": "IN", "noida": "IN", "gurgaon": "IN", "gurugram": "IN",
  "dhaka": "BD", "colombo": "LK", "kathmandu": "NP",
  // East Asia
  "tokyo": "JP", "osaka": "JP", "kyoto": "JP", "yokohama": "JP",
  "beijing": "CN", "shanghai": "CN", "shenzhen": "CN", "guangzhou": "CN", "chengdu": "CN", "hangzhou": "CN",
  "seoul": "KR", "busan": "KR", "taipei": "TW", "hong kong": "HK",
  // Southeast Asia
  "singapore": "SG", "bangkok": "TH", "jakarta": "ID", "manila": "PH",
  "ho chi minh city": "VN", "hanoi": "VN", "kuala lumpur": "MY",
  // Middle East
  "dubai": "AE", "abu dhabi": "AE", "riyadh": "SA", "doha": "QA",
  "istanbul": "TR", "ankara": "TR", "tel aviv": "IL", "tehran": "IR", "beirut": "LB",
  // Europe
  "london": "GB", "manchester": "GB", "edinburgh": "GB", "bristol": "GB", "cambridge": "GB", "oxford": "GB",
  "paris": "FR", "lyon": "FR", "marseille": "FR", "toulouse": "FR",
  "berlin": "DE", "munich": "DE", "hamburg": "DE", "frankfurt": "DE", "cologne": "DE", "stuttgart": "DE",
  "amsterdam": "NL", "rotterdam": "NL", "utrecht": "NL",
  "zurich": "CH", "geneva": "CH", "bern": "CH",
  "vienna": "AT", "madrid": "ES", "barcelona": "ES",
  "rome": "IT", "milan": "IT", "lisbon": "PT", "porto": "PT",
  "dublin": "IE", "brussels": "BE", "copenhagen": "DK",
  "stockholm": "SE", "oslo": "NO", "helsinki": "FI",
  "warsaw": "PL", "krakow": "PL", "prague": "CZ", "budapest": "HU",
  "bucharest": "RO", "sofia": "BG", "athens": "GR",
  "kyiv": "UA", "lviv": "UA", "moscow": "RU", "saint petersburg": "RU",
  "tallinn": "EE", "riga": "LV", "vilnius": "LT",
  "zagreb": "HR", "belgrade": "RS",
  // North America
  "new york": "US", "nyc": "US", "san francisco": "US", "sf": "US",
  "los angeles": "US", "chicago": "US", "seattle": "US", "austin": "US",
  "denver": "US", "boston": "US", "portland": "US", "san diego": "US",
  "atlanta": "US", "miami": "US", "dallas": "US", "houston": "US",
  "washington dc": "US", "washington, dc": "US", "san jose": "US",
  "silicon valley": "US", "bay area": "US", "brooklyn": "US", "phoenix": "US",
  "toronto": "CA", "vancouver": "CA", "montreal": "CA", "ottawa": "CA", "calgary": "CA", "waterloo": "CA",
  "mexico city": "MX", "guadalajara": "MX", "monterrey": "MX",
  // South America
  "são paulo": "BR", "sao paulo": "BR", "rio de janeiro": "BR", "brasilia": "BR", "curitiba": "BR",
  "buenos aires": "AR", "santiago": "CL", "bogota": "CO", "medellin": "CO", "lima": "PE",
  "montevideo": "UY", "quito": "EC",
  // Africa
  "lagos": "NG", "abuja": "NG", "nairobi": "KE", "cairo": "EG",
  "cape town": "ZA", "johannesburg": "ZA", "addis ababa": "ET", "accra": "GH",
  "dar es salaam": "TZ", "kampala": "UG", "kigali": "RW", "casablanca": "MA", "dakar": "SN",
  // Oceania
  "sydney": "AU", "melbourne": "AU", "brisbane": "AU", "perth": "AU", "canberra": "AU",
  "auckland": "NZ", "wellington": "NZ",
};

// Manual mapping for contributors who might have private or delayed profile locations
export const USER_LOCATION_OVERRIDES: Record<string, string> = {
  "Huzaifa-12Imran": "PK",
};

export const BULK_INSTALL = { threshold: 20, delayPerJobMs: 30_000 } as const;

export const BADGE_DEFAULTS = { cacheTtlSeconds: 3600, cacheControlMaxAge: 3600 } as const;

export const GITHUB_API = {
  restBaseUrl: "https://api.github.com",
  graphqlUrl: "https://api.github.com/graphql",
  throttleDelayMs: 200,
  maxRetries: 5,
  rateLimitPerHour: 5000,
} as const;
