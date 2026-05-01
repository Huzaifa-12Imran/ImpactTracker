"use client";

/**
 * World Map — contributor geography visualization.
 * Shows countries with contributors highlighted.
 */
import type { ContributorCountryMap } from "@impact/shared";

interface WorldMapProps {
  countries: ContributorCountryMap;
  totalContributors: number;
}

export default function WorldMap({ countries, totalContributors }: WorldMapProps) {
  // Sort countries by contributor count
  const sortedCountries = Object.entries(countries)
    .filter(([code]) => code !== "Unknown")
    .sort(([, a], [, b]) => b - a);

  const unknownCount = countries["Unknown"] ?? 0;
  const knownCount = totalContributors - unknownCount;
  const uniqueCountries = sortedCountries.length;

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-dark-400">
        Contributor Geography
      </h3>

      {/* Stats bar */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <StatBox label="Countries" value={String(uniqueCountries)} />
        <StatBox label="Located" value={`${knownCount}/${totalContributors}`} />
        <StatBox
          label="Coverage"
          value={`${totalContributors > 0 ? Math.round((knownCount / totalContributors) * 100) : 0}%`}
        />
      </div>

      {/* Country list with bar chart */}
      <div className="space-y-2">
        {sortedCountries.slice(0, 12).map(([code, count]) => {
          const maxCount = sortedCountries[0]?.[1] ?? 1;
          const barWidth = (count / maxCount) * 100;

          return (
            <div key={code} className="flex items-center gap-3">
              <span className="w-8 text-xs font-mono text-dark-400 text-right" style={{ fontFamily: "var(--font-mono)" }}>
                {code}
              </span>
              <div className="flex-1">
                <div className="h-5 rounded-sm bg-dark-800/50 overflow-hidden">
                  <div
                    className="h-full rounded-sm bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-700"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-xs font-mono text-dark-400" style={{ fontFamily: "var(--font-mono)" }}>
                {count}
              </span>
            </div>
          );
        })}

        {sortedCountries.length > 12 && (
          <p className="pt-1 text-center text-xs text-dark-500">
            +{sortedCountries.length - 12} more countries
          </p>
        )}

        {unknownCount > 0 && (
          <p className="pt-2 text-xs text-dark-600">
            {unknownCount} contributor{unknownCount !== 1 ? "s" : ""} with unresolvable location
          </p>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-dark-800/30 p-3 text-center">
      <p className="text-lg font-bold text-white font-mono" style={{ fontFamily: "var(--font-mono)" }}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-dark-500">{label}</p>
    </div>
  );
}
