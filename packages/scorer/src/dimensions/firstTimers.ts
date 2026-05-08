/**
 * Contributor Reach Dimension (0-20 points)
 *
 * Rewards repos that attract multiple contributors.
 * 10+ contributors = full score, scales linearly below that.
 */


export interface FirstTimerInput {
  firstTimerCount: number;
  totalContributors: number;
}

export function scoreFirstTimerOnboarding(input: FirstTimerInput): number {
  const { totalContributors } = input;

  if (totalContributors === 0) return 0;

  // Scale: 10+ contributors = full score (20 pts), linear below
  const normalized = Math.min(totalContributors / 10, 1.0);
  const score = normalized * 20;

  return Math.round(score * 100) / 100;
}
