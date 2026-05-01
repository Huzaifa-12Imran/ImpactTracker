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
  strokeWidth = 2,
  label = "Impact Score",
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "#84CC16"; // Acid Lime
    if (s >= 60) return "#7C3AED"; // Violet
    if (s >= 40) return "#fbbf24"; // Yellow
    return "#F43F5E"; // Coral/Rose
  };

  return (
    <div className="flex flex-col items-center gap-4">
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
            stroke="#0f172a"
            strokeWidth={1}
            strokeDasharray="2,4"
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth * 4}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-syne text-5xl font-bold tracking-tighter text-jet-black"
          >
            {Math.round(score)}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">SCORE</span>
        </div>
      </div>
      <span className="font-syne text-xs font-bold uppercase tracking-[0.2em] text-jet-black">{label}</span>
    </div>
  );
}
