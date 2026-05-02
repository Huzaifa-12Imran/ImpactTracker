/**
 * Community Health Dimension (0-10 points)
 *
 * Points for:
 * - Issue response time < 48 hours: 4 points
 * - PR merge rate > 50%: 3 points
 * - Active in last 30 days: 3 points
 */
import type { CommunityProfile } from "@impact/shared";

export interface CommunityInput {
  communityProfile: CommunityProfile | null;
  avgIssueResponseHours: number | null;
  prMergeRate: number | null; // 0.0 - 1.0
  lastActivityDate: Date | null;
}

export function scoreCommunityHealth(input: CommunityInput): number {
  let score = 0;

  // 1. Community Profile Health (0-4 points)
  // Rewards templates, license, and CoC
  if (input.communityProfile) {
    score += (input.communityProfile.healthPercentage / 100) * 4;
  }

  // 2. Issue response time (0-2 points)
  if (input.avgIssueResponseHours !== null) {
    if (input.avgIssueResponseHours <= 48) {
      score += 2;
    } else if (input.avgIssueResponseHours <= 168) {
      score += Math.round((1 - (input.avgIssueResponseHours - 48) / 120) * 2 * 100) / 100;
    }
  }

  // 3. PR merge rate (0-2 points)
  if (input.prMergeRate !== null) {
    if (input.prMergeRate >= 0.5) {
      score += 2;
    } else {
      score += Math.round((input.prMergeRate / 0.5) * 2 * 100) / 100;
    }
  }

  // 4. Recent activity (0-2 points)
  if (input.lastActivityDate) {
    const daysSinceActivity = Math.floor(
      (Date.now() - input.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActivity <= 30) {
      score += 2;
    } else if (daysSinceActivity <= 90) {
      score += Math.round((1 - (daysSinceActivity - 30) / 60) * 2 * 100) / 100;
    }
  }

  return Math.min(Math.round(score * 100) / 100, 10);
}
