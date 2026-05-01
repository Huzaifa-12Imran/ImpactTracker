/**
 * SVG Badge Generator
 *
 * Uses badge-maker (official Shields.io library) to generate
 * dynamic SVG badges for repository impact scores.
 *
 * Three badge styles:
 *   - default: [Health Impact │ 84/100]
 *   - flat:    [Impact │ 84]
 *   - sdg:     [SDG 3,10 │ Health]
 */
import { makeBadge } from "badge-maker";
import type { Sector, BadgeStyle } from "@impact/shared";
import { SECTOR_BADGE_COLORS, getScoreColor, PENDING_COLOR } from "./colors.js";

export interface GenerateBadgeInput {
  score: number | null;
  sector: Sector | null;
  sdgGoals?: number[];
  style?: BadgeStyle;
}

/**
 * Generate an SVG badge string.
 */
export function generateBadge(input: GenerateBadgeInput): string {
  const style = input.style ?? "default";

  // Pending / unscored state
  if (input.score === null || input.sector === null) {
    return makeBadge({
      label: "Impact",
      message: "pending",
      color: PENDING_COLOR,
      style: "flat",
    });
  }

  switch (style) {
    case "flat":
      return makeBadge({
        label: "Impact",
        message: String(Math.round(input.score)),
        color: getScoreColor(input.score),
        style: "flat",
      });

    case "sdg":
      return makeBadge({
        label: `SDG ${(input.sdgGoals ?? []).join(",")}`,
        message: input.sector,
        color: SECTOR_BADGE_COLORS[input.sector],
        style: "flat",
      });

    case "default":
    default:
      return makeBadge({
        label: `${input.sector} Impact`,
        message: `${Math.round(input.score)}/100`,
        color: SECTOR_BADGE_COLORS[input.sector],
        style: "flat",
      });
  }
}

/**
 * Generate the markdown embed snippet for a badge.
 */
export function generateBadgeMarkdown(
  baseUrl: string,
  owner: string,
  repo: string,
  style?: BadgeStyle
): string {
  const styleParam = style && style !== "default" ? `?style=${style}` : "";
  const url = `${baseUrl}/api/badge/${owner}/${repo}.svg${styleParam}`;
  return `![Impact Score](${url})`;
}

export { SECTOR_BADGE_COLORS, getScoreColor, PENDING_COLOR } from "./colors.js";
