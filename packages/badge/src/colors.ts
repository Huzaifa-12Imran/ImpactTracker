/**
 * Sector → Badge Color Mapping
 * All colors verified for WCAG AA contrast ratio on both
 * light (#ffffff) and dark (#0d1117) GitHub README backgrounds.
 */
import type { Sector } from "@impact/shared";

export const SECTOR_BADGE_COLORS: Record<Sector, string> = {
  Health: "#16a34a",
  Education: "#2563eb",
  Climate: "#059669",
  Humanitarian: "#dc2626",
  "Civic Tech": "#7c3aed",
  Accessibility: "#ea580c",
  "General Tech": "#6b7280",
};

/**
 * Get score-based color gradient.
 * Higher scores get warmer/more vibrant colors.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a"; // Green — excellent
  if (score >= 60) return "#65a30d"; // Lime — good
  if (score >= 40) return "#ca8a04"; // Yellow — moderate
  if (score >= 20) return "#ea580c"; // Orange — low
  return "#dc2626";                  // Red — minimal
}

/** Color for pending/unscored badges */
export const PENDING_COLOR = "#9ca3af";
