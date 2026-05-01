/**
 * Documentation Accessibility Dimension (0-15 points)
 *
 * Points for:
 * - README length > 500 chars: 5 points
 * - CONTRIBUTING.md exists: 5 points
 * - CODE_OF_CONDUCT.md exists: 5 points
 */
import { SCORING_THRESHOLDS } from "@impact/shared";

export interface DocsInput {
  readmeLength: number;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
}

export function scoreDocsAccessibility(input: DocsInput): number {
  let score = 0;

  // README quality (0-5)
  if (input.readmeLength > SCORING_THRESHOLDS.minReadmeLength) {
    score += 5;
  } else if (input.readmeLength > 0) {
    // Partial credit for short READMEs
    score += Math.round((input.readmeLength / SCORING_THRESHOLDS.minReadmeLength) * 5 * 100) / 100;
  }

  // CONTRIBUTING.md (0-5)
  if (input.hasContributing) score += 5;

  // CODE_OF_CONDUCT.md (0-5)
  if (input.hasCodeOfConduct) score += 5;

  return Math.min(score, 15);
}
