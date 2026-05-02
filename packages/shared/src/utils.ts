import type { Sector } from "./types.js";
import { CITY_COUNTRY_MAP, SECTOR_KEYWORDS, USER_LOCATION_OVERRIDES } from "./constants.js";
import { createHash } from "crypto";

/**
 * Resolve a free-text GitHub location to a 2-letter country code.
 * Four-tier strategy: manual override → direct match → city lookup → unknown.
 */
export function resolveCountry(location: string | null | undefined, login?: string): string | null {
  // Tier 0: Manual Override (Case-insensitive)
  if (login) {
    const normalizedLogin = login.toLowerCase();
    for (const [ovLogin, country] of Object.entries(USER_LOCATION_OVERRIDES)) {
      if (ovLogin.toLowerCase() === normalizedLogin) {
        return country;
      }
    }
  }

  if (!location || location.trim().length === 0) return null;

  const cleaned = location.trim().toLowerCase();

  // Filter out obvious non-locations
  const nonsense = ["earth", "remote", "the internet", "internet", "worldwide",
    "somewhere", "anywhere", "everywhere", "home", "here", "there", "n/a",
    "none", "null", "undefined", "localhost", "127.0.0.1", "0.0.0.0"];
  if (nonsense.includes(cleaned)) return null;

  // Strip common emoji flags and decorators
  const stripped = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "").replace(/[^\w\s,.-]/g, "").trim();
  if (!stripped) return null;

  // Tier 1: Direct country name or ISO code
  const tier1 = matchCountryDirect(stripped);
  if (tier1) return tier1;

  // Tier 2: City lookup
  const tier2 = matchCity(stripped);
  if (tier2) return tier2;

  return null;
}

function matchCountryDirect(input: string): string | null {
  // ISO 2-letter codes
  if (/^[a-z]{2}$/.test(input)) {
    const code = input.toUpperCase();
    if (ISO_COUNTRIES[code]) return code;
  }

  // Full country name match
  for (const [code, names] of Object.entries(COUNTRY_ALIASES)) {
    for (const name of names) {
      if (input === name || input.includes(name)) return code;
    }
  }
  return null;
}

function matchCity(input: string): string | null {
  // Try the whole string first (normalized)
  const normalized = input.toLowerCase().trim();
  if (CITY_COUNTRY_MAP[normalized]) return CITY_COUNTRY_MAP[normalized];

  // Try segments separated by comma or period
  const parts = input.split(/[,\.]/).map((p) => p.trim().toLowerCase());
  for (const part of parts) {
    if (CITY_COUNTRY_MAP[part]) return CITY_COUNTRY_MAP[part];
  }
  return null;
}

/**
 * Generate SHA-256 content hash for change detection.
 */
export function computeContentHash(readme: string | null, topics: string[]): string {
  const content = `${readme ?? ""}|${topics.sort().join(",")}`;
  return createHash("sha256").update(content).digest("hex");
}

export function classifyByKeywords(topics: string[], readmeExcerpt: string | null): {
  sector: Sector;
  confidence: number;
  matchedKeywords: string[];
} {
  const searchText = [
    ...topics.map(t => t.toLowerCase()),
    ...(readmeExcerpt?.toLowerCase().split(/\s+/) ?? []),
  ].join(" ");

  let bestSector: Sector = "General Tech";
  let bestScore = 0;
  let bestKeywords: string[] = [];

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS) as [Sector, string[]][]) {
    if (keywords.length === 0) continue;
    
    // Use word boundaries to avoid matching substrings (e.g. "tailwind" matching "wind")
    const matched = keywords.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      return regex.test(searchText);
    });

    const score = matched.length / keywords.length;
    if (score > bestScore) {
      bestScore = score;
      bestSector = sector;
      bestKeywords = matched;
    }
  }

  // Require at least 2 keywords for a confident match, or a very high score
  const isConfident = bestKeywords.length >= 2 || (bestKeywords.length === 1 && bestScore > 0.5);

  return {
    sector: isConfident ? bestSector : "General Tech",
    confidence: isConfident ? 0.6 : 0.1,
    matchedKeywords: bestKeywords,
  };
}

// Subset of ISO countries for direct matching
const ISO_COUNTRIES: Record<string, boolean> = {
  AF:true,AL:true,DZ:true,AR:true,AU:true,AT:true,BD:true,BE:true,BR:true,
  BG:true,CA:true,CL:true,CN:true,CO:true,HR:true,CZ:true,DK:true,EG:true,
  EE:true,ET:true,FI:true,FR:true,DE:true,GH:true,GR:true,HK:true,HU:true,
  IS:true,IN:true,ID:true,IR:true,IQ:true,IE:true,IL:true,IT:true,JP:true,
  JO:true,KE:true,KR:true,KW:true,LV:true,LB:true,LT:true,MY:true,MX:true,
  MA:true,MZ:true,MM:true,NP:true,NL:true,NZ:true,NG:true,NO:true,OM:true,
  PK:true,PE:true,PH:true,PL:true,PT:true,QA:true,RO:true,RU:true,RW:true,
  SA:true,SN:true,RS:true,SG:true,SK:true,SI:true,ZA:true,ES:true,LK:true,
  SE:true,CH:true,TW:true,TZ:true,TH:true,TN:true,TR:true,UA:true,AE:true,
  GB:true,US:true,UY:true,UZ:true,VE:true,VN:true,ZM:true,ZW:true,
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  US: ["united states", "usa", "u.s.a.", "u.s.", "america"],
  GB: ["united kingdom", "uk", "u.k.", "england", "scotland", "wales", "britain", "great britain"],
  CN: ["china", "peoples republic of china", "prc"],
  IN: ["india"],
  DE: ["germany", "deutschland"],
  FR: ["france"],
  JP: ["japan"],
  BR: ["brazil", "brasil"],
  CA: ["canada"],
  AU: ["australia"],
  KR: ["south korea", "korea"],
  IT: ["italy", "italia"],
  ES: ["spain", "españa"],
  NL: ["netherlands", "holland"],
  SE: ["sweden", "sverige"],
  NO: ["norway", "norge"],
  DK: ["denmark", "danmark"],
  FI: ["finland", "suomi"],
  PL: ["poland", "polska"],
  CZ: ["czech republic", "czechia"],
  PT: ["portugal"],
  CH: ["switzerland"],
  AT: ["austria"],
  BE: ["belgium"],
  IE: ["ireland"],
  RU: ["russia"],
  UA: ["ukraine"],
  TR: ["turkey", "türkiye"],
  IL: ["israel"],
  AE: ["united arab emirates", "uae"],
  SA: ["saudi arabia"],
  PK: ["pakistan"],
  BD: ["bangladesh"],
  NG: ["nigeria"],
  KE: ["kenya"],
  GH: ["ghana"],
  ZA: ["south africa"],
  EG: ["egypt"],
  MA: ["morocco"],
  AR: ["argentina"],
  MX: ["mexico", "méxico"],
  CO: ["colombia"],
  CL: ["chile"],
  PE: ["peru"],
  SG: ["singapore"],
  MY: ["malaysia"],
  TH: ["thailand"],
  VN: ["vietnam", "viet nam"],
  ID: ["indonesia"],
  PH: ["philippines"],
  NZ: ["new zealand"],
  HK: ["hong kong"],
  TW: ["taiwan"],
  RO: ["romania"],
  HU: ["hungary"],
  GR: ["greece"],
  BG: ["bulgaria"],
};
