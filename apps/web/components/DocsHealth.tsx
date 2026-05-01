"use client";

/**
 * Documentation Health Card — shows README, CONTRIBUTING, CODE_OF_CONDUCT status.
 */

interface DocsHealthProps {
  readmeLength: number;
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  docsScore: number;
  maxScore: number;
}

export default function DocsHealth({
  readmeLength,
  hasContributing,
  hasCodeOfConduct,
  docsScore,
  maxScore,
}: DocsHealthProps) {
  const items = [
    {
      label: "README.md",
      status: readmeLength > 500 ? "complete" : readmeLength > 0 ? "partial" : "missing",
      detail: readmeLength > 500
        ? `${(readmeLength / 1000).toFixed(1)}K CHARS`
        : readmeLength > 0
          ? `SHORT_LEN`
          : "NOT_FOUND",
    },
    {
      label: "CONTRIBUTING.md",
      status: hasContributing ? "complete" : "missing",
      detail: hasContributing ? "DETECTED" : "NOT_FOUND",
    },
    {
      label: "CODE_OF_CONDUCT.md",
      status: hasCodeOfConduct ? "complete" : "missing",
      detail: hasCodeOfConduct ? "DETECTED" : "NOT_FOUND",
    },
  ];

  return (
    <div className="console-card p-8 bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Docs / Transparency
        </h3>
        <span
          className="font-mono text-[10px] font-bold"
          style={{
            color: docsScore >= maxScore * 0.8 ? "#84cc16" : docsScore >= maxScore * 0.5 ? "#7c3aed" : "#f43f5e",
          }}
        >
          {docsScore}/{maxScore}
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <StatusIcon status={item.status} />
              <span className="font-syne text-xs font-bold tracking-tight text-jet-black">{item.label}</span>
            </div>
            <span className="font-mono text-[9px] font-bold text-slate-400">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "complete") {
    return <div className="h-2 w-2 bg-accent-500" />;
  }
  if (status === "partial") {
    return <div className="h-2 w-2 bg-primary-600" />;
  }
  return <div className="h-2 w-2 bg-slate-200" />;
}
