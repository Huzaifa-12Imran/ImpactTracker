/**
 * Sector Relevance Dimension (0-30 points)
 *
 * Non-"General Tech" sectors get base 20 points.
 * SDG alignment adds up to 10 additional points.
 * Confidence scales the final score.
 */
import type { Sector, SDGGoal } from "@impact/shared";
import { DEFAULT_SDG_WEIGHTS, SCORING_THRESHOLDS } from "@impact/shared";

export interface SectorInput {
  sector: Sector;
  confidence: number;
  sdgGoals: SDGGoal[];
  sdgWeightOverrides?: Record<number, number>;
}

export function scoreSectorRelevance(input: SectorInput): number {
  const { sector, confidence, sdgGoals, sdgWeightOverrides } = input;

  // General Tech gets minimal points
  if (sector === "General Tech") {
    return Math.round(confidence * 5 * 100) / 100;
  }

  // Base score: 20 points for having a social-impact sector
  let baseScore = 20;

  // SDG bonus: up to 10 points based on SDG alignment
  if (sdgGoals.length > 0) {
    const weights = { ...DEFAULT_SDG_WEIGHTS, ...sdgWeightOverrides };
    const avgWeight =
      sdgGoals.reduce((sum, goal) => sum + (weights[goal] ?? 0.8), 0) / sdgGoals.length;
    const sdgBonus = Math.min(avgWeight * sdgGoals.length * 2, 10);
    baseScore += sdgBonus;
  }

  // Scale by confidence
  const effectiveConfidence = confidence >= SCORING_THRESHOLDS.minClassificationConfidence
    ? confidence
    : confidence * 0.7; // penalize low-confidence classifications

  const finalScore = Math.min(baseScore * effectiveConfidence, 30);
  return Math.round(finalScore * 100) / 100;
}
