"use client";

/**
 * Radar chart for the 5 scoring dimensions.
 * Pure SVG implementation — no external chart library needed.
 */
import type { ScoreDimensions } from "@impact/shared";

interface RadarChartProps {
  dimensions: ScoreDimensions;
  size?: number;
}

const LABELS = [
  { key: "sectorRelevance", label: "Sector", max: 30 },
  { key: "contributorGeography", label: "Geography", max: 25 },
  { key: "firstTimerOnboarding", label: "First-Timers", max: 20 },
  { key: "docsAccessibility", label: "Docs", max: 15 },
  { key: "communityHealth", label: "Community", max: 10 },
] as const;

export default function RadarChart({ dimensions, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const maxRadius = size * 0.38;
  const angleStep = (2 * Math.PI) / LABELS.length;
  const startAngle = -Math.PI / 2; // Start from top

  // Generate polygon points for the data
  const dataPoints = LABELS.map((dim, i) => {
    const value = dimensions[dim.key] / dim.max; // normalize to 0-1
    const angle = startAngle + i * angleStep;
    const r = value * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: dim.label,
      value: dimensions[dim.key],
      max: dim.max,
      angle,
    };
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Generate grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-dark-400">
        Score Breakdown
      </h3>

      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid rings */}
          {rings.map((ring) => {
            const r = ring * maxRadius;
            const ringPoints = LABELS.map((_, i) => {
              const angle = startAngle + i * angleStep;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(" ");

            return (
              <polygon
                key={ring}
                points={ringPoints}
                fill="none"
                stroke="rgba(148, 163, 184, 0.1)"
                strokeWidth={1}
              />
            );
          })}

          {/* Axis lines */}
          {LABELS.map((_, i) => {
            const angle = startAngle + i * angleStep;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={center + maxRadius * Math.cos(angle)}
                y2={center + maxRadius * Math.sin(angle)}
                stroke="rgba(148, 163, 184, 0.08)"
                strokeWidth={1}
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(6, 182, 212, 0.15)"
            stroke="#06b6d4"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#06b6d4"
              stroke="#0f172a"
              strokeWidth={2}
            />
          ))}

          {/* Labels */}
          {dataPoints.map((point, i) => {
            const labelR = maxRadius + 24;
            const angle = startAngle + i * angleStep;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            return (
              <g key={`label-${i}`}>
                <text
                  x={lx}
                  y={ly - 6}
                  textAnchor="middle"
                  className="fill-dark-300 text-[11px] font-medium"
                >
                  {point.label}
                </text>
                <text
                  x={lx}
                  y={ly + 8}
                  textAnchor="middle"
                  className="fill-dark-500 text-[10px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {point.value}/{point.max}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
