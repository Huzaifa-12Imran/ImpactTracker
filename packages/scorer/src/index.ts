/**
 * Impact Scoring Engine
 *
 * Computes a 0-100 impact score across 5 dimensions:
 *   - Sector Relevance (30 pts)
 *   - Contributor Geography (25 pts)
 *   - First-Timer Onboarding (20 pts)
 *   - Docs Accessibility (15 pts)
 *   - Community Health (10 pts)
 */
import type {
  Sector,
  SDGGoal,
  ImpactScoreResult,
  CommunityProfile,
} from "@impact/shared";
import { computeContentHash } from "@impact/shared";
import { scoreSectorRelevance, type SectorInput } from "./dimensions/sector.js";
import { scoreContributorGeography, buildCountryMap } from "./dimensions/geography.js";
import { scoreFirstTimerOnboarding } from "./dimensions/firstTimers.js";
import { scoreDocsAccessibility } from "./dimensions/docs.js";
import { scoreCommunityHealth } from "./dimensions/community.js";

export interface ScoreInput {
  // Sector classification
  sector: Sector;
  sectorConfidence: number;
  sdgGoals: SDGGoal[];
  sectorKeywords: string[];

  // SDG weight overrides from AppConfig
  sdgWeightOverrides?: Record<number, number>;

  // Contributors
  contributors: Array<{
    resolvedCountry: string | null;
    isFirstTimer: boolean;
  }>;

  // Documentation
  readmeContent: string | null;
  topics: string[];
  hasContributing: boolean;
  hasCodeOfConduct: boolean;

  // Community
  communityProfile: CommunityProfile | null;
  avgIssueResponseHours: number | null;
  prMergeRate: number | null;
  lastActivityDate: Date | null;
}

/**
 * Compute the full impact score for a repository.
 */
export function computeImpactScore(input: ScoreInput): ImpactScoreResult {
  // 1. Sector Relevance (0-30)
  const sectorInput: SectorInput = {
    sector: input.sector,
    confidence: input.sectorConfidence,
    sdgGoals: input.sdgGoals,
    sdgWeightOverrides: input.sdgWeightOverrides,
  };
  const sectorRelevance = scoreSectorRelevance(sectorInput);

  // 2. Contributor Geography (0-25)
  const countryMap = buildCountryMap(input.contributors);
  const contributorGeography = scoreContributorGeography({
    contributorCountries: countryMap,
    totalContributors: input.contributors.length,
  });

  // 3. First-Timer Onboarding (0-20)
  const firstTimerCount = input.contributors.filter((c) => c.isFirstTimer).length;
  const firstTimerOnboarding = scoreFirstTimerOnboarding({
    firstTimerCount,
    totalContributors: input.contributors.length,
  });

  // 4. Docs Accessibility (0-15)
  const docsAccessibility = scoreDocsAccessibility({
    readmeLength: input.readmeContent?.length ?? 0,
    hasContributing: input.hasContributing,
    hasCodeOfConduct: input.hasCodeOfConduct,
  });

  // 5. Community Health (0-10)
  const communityHealth = scoreCommunityHealth({
    communityProfile: input.communityProfile,
    avgIssueResponseHours: input.avgIssueResponseHours,
    prMergeRate: input.prMergeRate,
    lastActivityDate: input.lastActivityDate,
  });

  // Total
  const totalScore = Math.round(
    (sectorRelevance + contributorGeography + firstTimerOnboarding +
      docsAccessibility + communityHealth) * 100
  ) / 100;

  // Content hash for change detection
  const contentHash = computeContentHash(input.readmeContent, input.topics);

  return {
    totalScore: Math.min(totalScore, 100),
    sectorRelevance,
    contributorGeography,
    firstTimerOnboarding,
    docsAccessibility,
    communityHealth,
    sector: input.sector,
    sectorConfidence: input.sectorConfidence,
    sdgGoals: input.sdgGoals,
    sectorKeywords: input.sectorKeywords,
    contentHash,
  };
}

// Re-export dimension functions for testing
export { scoreSectorRelevance } from "./dimensions/sector.js";
export { scoreContributorGeography, buildCountryMap } from "./dimensions/geography.js";
export { scoreFirstTimerOnboarding } from "./dimensions/firstTimers.js";
export { scoreDocsAccessibility } from "./dimensions/docs.js";
export { scoreCommunityHealth } from "./dimensions/community.js";
