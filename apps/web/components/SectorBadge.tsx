"use client";

import { SECTOR_COLORS, SDG_GOAL_NAMES } from "@impact/shared";
import type { Sector, SDGGoal } from "@impact/shared";

interface SectorBadgeProps {
  sector: Sector;
  confidence: number;
  sdgGoals: number[];
  keywords: string[];
}

export default function SectorBadge({
  sector,
  confidence,
  sdgGoals,
  keywords,
}: SectorBadgeProps) {
  const color = SECTOR_COLORS[sector];

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-dark-400">
        Sector Classification
      </h3>

      {/* Sector pill */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className="rounded-full px-4 py-1.5 text-sm font-semibold"
          style={{
            backgroundColor: `${color}20`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {sector}
        </span>
        <span className="text-xs text-dark-500">
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      {/* SDG Tags */}
      {sdgGoals.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-dark-500 uppercase tracking-wider">
            UN Sustainable Development Goals
          </p>
          <div className="flex flex-wrap gap-2">
            {sdgGoals.map((goal) => (
              <span
                key={goal}
                className="rounded-md bg-dark-800 px-2.5 py-1 text-xs text-dark-300"
                title={SDG_GOAL_NAMES[goal as SDGGoal] ?? `SDG ${goal}`}
              >
                SDG {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-dark-500 uppercase tracking-wider">
            Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="rounded bg-dark-800/50 px-2 py-0.5 text-xs text-dark-400"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
