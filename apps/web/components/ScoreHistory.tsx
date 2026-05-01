"use client";

/**
 * Score History — line chart showing impact score over time.
 * Uses Recharts for the visualization.
 */
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { ScoreHistoryEntry } from "@impact/shared";

interface ScoreHistoryProps {
  history: ScoreHistoryEntry[];
}

export default function ScoreHistory({ history }: ScoreHistoryProps) {
  const data = history.map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }).toUpperCase(),
    score: Math.round(entry.totalScore * 10) / 10,
    sector: entry.dimensions.sectorRelevance,
    geography: entry.dimensions.contributorGeography,
    firstTimers: entry.dimensions.firstTimerOnboarding,
    docs: entry.dimensions.docsAccessibility,
    community: entry.dimensions.communityHealth,
  }));

  if (data.length === 0) {
    return (
      <div className="console-card p-8 bg-white">
        <h3 className="mb-6 font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Historical Performance
        </h3>
        <div className="flex h-48 items-center justify-center font-mono text-[10px] font-bold text-slate-300">
          INSUFFICIENT_DATA_POINTS
        </div>
      </div>
    );
  }

  return (
    <div className="console-card p-8 bg-white">
      <h3 className="mb-6 font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Impact Trend / Analysis
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: "#0f172a", strokeOpacity: 0.1 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: "#0f172a", strokeOpacity: 0.1 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "none",
                color: "#ffffff",
                fontSize: "10px",
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '8px 12px'
              }}
              itemStyle={{ color: '#84cc16' }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#7c3aed"
              strokeWidth={3}
              fill="url(#scoreGradient)"
              dot={{ fill: "#84cc16", r: 4, strokeWidth: 2, stroke: "#0f172a" }}
              activeDot={{ r: 6, fill: "#84cc16", stroke: "#0f172a", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
