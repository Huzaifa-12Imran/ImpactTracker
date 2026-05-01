/**
 * First-Timer Onboarding Dimension (0-20 points)
 *
 * Rewards repos that actively welcome new developers.
 * Ratio of first-time contributors in the contributor base.
 * 50%+ first-timers = full score.
 */
import { SCORING_THRESHOLDS } from "@impact/shared";

export interface FirstTimerInput {
  firstTimerCount: number;
  totalContributors: number;
}

export function scoreFirstTimerOnboarding(input: FirstTimerInput): number {
  const { firstTimerCount, totalContributors } = input;

  if (totalContributors === 0) return 0;

  const ratio = firstTimerCount / totalContributors;

  // Scale: 50%+ first-timers = full score, linear below that
  const normalized = Math.min(ratio / SCORING_THRESHOLDS.maxFirstTimerRatio, 1.0);
  const score = normalized * 20;

  return Math.round(score * 100) / 100;
}
