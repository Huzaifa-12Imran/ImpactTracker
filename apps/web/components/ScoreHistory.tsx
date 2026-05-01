"use client";

/**
 * Score History — line chart showing impact score over time.
 * Uses Recharts for the visualization.
 */
import {
  LineChart,
  Line,
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
    }),
    score: Math.round(entry.totalScore * 10) / 10,
    sector: entry.dimensions.sectorRelevance,
    geography: entry.dimensions.contributorGeography,
    firstTimers: entry.dimensions.firstTimerOnboarding,
    docs: entry.dimensions.docsAccessibility,
    community: entry.dimensions.communityHealth,
  }));

  if (data.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-dark-400">
          Score History
        </h3>
        <div className="flex h-48 items-center justify-center text-dark-500">
          Not enough data points yet. Check back after the next analysis.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-dark-400">
        Score History
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.1)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "rgba(148, 163, 184, 0.1)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ fill: "#06b6d4", r: 3, strokeWidth: 2, stroke: "#0f172a" }}
              activeDot={{ r: 5, fill: "#22d3ee" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
