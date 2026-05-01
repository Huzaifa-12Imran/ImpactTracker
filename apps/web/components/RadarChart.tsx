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

export default function RadarChart({ dimensions, size = 320 }: RadarChartProps) {
  const center = size / 2;
  const maxRadius = size * 0.35;
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
    <div className="console-card p-8 bg-white">
      <h3 className="mb-6 font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Metric Distribution
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
                stroke="#0f172a"
                strokeWidth={0.5}
                strokeDasharray="2,2"
                opacity={0.15}
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
                stroke="#0f172a"
                strokeWidth={0.5}
                opacity={0.1}
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="#7c3aed"
            fillOpacity={0.1}
            stroke="#7c3aed"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={3}
              fill="#84cc16"
              stroke="#0f172a"
              strokeWidth={1.5}
            />
          ))}

          {/* Labels */}
          {dataPoints.map((point, i) => {
            const labelR = maxRadius + 30;
            const angle = startAngle + i * angleStep;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            return (
              <g key={`label-${i}`}>
                <text
                  x={lx}
                  y={ly - 6}
                  textAnchor="middle"
                  className="font-syne text-[10px] font-bold uppercase tracking-tighter fill-jet-black"
                >
                  {point.label}
                </text>
                <text
                  x={lx}
                  y={ly + 8}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold fill-slate-400"
                >
                  [{point.value}/{point.max}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
