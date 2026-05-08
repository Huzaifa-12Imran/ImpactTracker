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
  const countryCount = Object.keys(input.contributorCountries).length;

  if (countryCount === 0) return 0;

  // Massively buff geography: 1 country gives 15 points, 2+ gives 25 points
  let score = 0;
  if (countryCount === 1) score = 15;
  if (countryCount >= 2) score = 25;

  return Math.min(score, SCORE_MAX.contributorGeography);
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
