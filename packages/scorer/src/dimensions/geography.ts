/**
 * Contributor Geography Dimension (0-25 points)
 *
 * Measures the number of unique countries represented in contributor profiles.
 * 15+ unique countries = full score.
 */
import type { ContributorCountryMap } from "@impact/shared";
import { SCORING_THRESHOLDS } from "@impact/shared";

export interface GeographyInput {
  contributorCountries: ContributorCountryMap;
  totalContributors: number;
}

export function scoreContributorGeography(input: GeographyInput): number {
  const { contributorCountries, totalContributors } = input;

  if (totalContributors === 0) return 0;

  // Count unique countries (exclude "Unknown")
  const countries = Object.keys(contributorCountries).filter((c) => c !== "Unknown");
  const uniqueCountries = countries.length;

  if (uniqueCountries === 0) return 0;

  // Linear scale: 15 countries = full score
  const ratio = Math.min(uniqueCountries / SCORING_THRESHOLDS.maxGeographyCountries, 1.0);
  const score = ratio * 25;

  return Math.round(score * 100) / 100;
}

/**
 * Build a country frequency map from contributors.
 */
export function buildCountryMap(
  contributors: Array<{ resolvedCountry: string | null }>
): ContributorCountryMap {
  const map: ContributorCountryMap = {};
  for (const contrib of contributors) {
    const country = contrib.resolvedCountry ?? "Unknown";
    map[country] = (map[country] ?? 0) + 1;
  }
  return map;
}
