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
    <div className="console-card p-8 bg-white">
      <h3 className="mb-6 font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Classification Output
      </h3>

      {/* Sector pill */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className="border border-jet-black px-4 py-2 font-syne text-sm font-bold uppercase tracking-widest"
          style={{
            backgroundColor: `${color}15`,
            color: "#0f172a",
            borderColor: "#0f172a",
          }}
        >
          {sector}
        </div>
        <div className="font-mono text-[10px] font-bold uppercase text-slate-500">
          CONF: {Math.round(confidence * 100)}%
        </div>
      </div>

      {/* SDG Tags */}
      {sdgGoals.length > 0 && (
        <div className="mb-6 border-t border-slate-100 pt-6">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Target SDGs
          </p>
          <div className="flex flex-wrap gap-2">
            {sdgGoals.map((goal) => (
              <span
                key={goal}
                className="border border-jet-black bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-jet-black"
                title={SDG_GOAL_NAMES[goal as SDGGoal] ?? `SDG ${goal}`}
              >
                GOAL_{goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Detected Tokens
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="bg-slate-100 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-500"
              >
                #{kw.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
