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
        ? `${(readmeLength / 1000).toFixed(1)}k characters`
        : readmeLength > 0
          ? `Only ${readmeLength} chars (500+ recommended)`
          : "Not found",
    },
    {
      label: "CONTRIBUTING.md",
      status: hasContributing ? "complete" : "missing",
      detail: hasContributing ? "Present" : "Not found",
    },
    {
      label: "CODE_OF_CONDUCT.md",
      status: hasCodeOfConduct ? "complete" : "missing",
      detail: hasCodeOfConduct ? "Present" : "Not found",
    },
  ];

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-dark-400">
          Documentation Health
        </h3>
        <span
          className="text-sm font-mono font-semibold"
          style={{
            color: docsScore >= maxScore * 0.8 ? "#22d3ee" : docsScore >= maxScore * 0.5 ? "#f59e0b" : "#dc2626",
            fontFamily: "var(--font-mono)",
          }}
        >
          {docsScore}/{maxScore}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon status={item.status} />
              <span className="text-sm font-medium text-dark-200">{item.label}</span>
            </div>
            <span className="text-xs text-dark-500">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "complete") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20">
        <svg className="h-3 w-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
      <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}
