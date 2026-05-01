"use client";

/**
 * Circular Score Gauge — animated SVG ring showing 0-100 impact score.
 */
interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreGauge({
  score,
  size = 200,
  strokeWidth = 12,
  label = "Impact Score",
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#22d3ee";
    if (s >= 60) return "#06b6d4";
    if (s >= 40) return "#f59e0b";
    if (s >= 20) return "#ea580c";
    return "#dc2626";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score-fill transition-all duration-1000"
            style={{
              filter: `drop-shadow(0 0 8px ${getColor(score)}40)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono text-4xl font-bold text-white animate-counter-up"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {Math.round(score)}
          </span>
          <span className="text-xs text-dark-400 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-dark-400">{label}</span>
    </div>
  );
}
