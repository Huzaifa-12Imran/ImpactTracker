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
  if (input.totalContributors === 0) return 0;

  // Massively buff contributor score:
  // 1 contributor = 10 points
  // 2+ contributors = 20 points
  let score = 0;
  if (input.totalContributors >= 1) score = 10;
  if (input.totalContributors >= 2) score = 20;

  return Math.min(score, 20);
}
