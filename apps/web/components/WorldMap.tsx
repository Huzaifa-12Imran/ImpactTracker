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
    <div className="console-card p-8 bg-white">
      <h3 className="mb-6 font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Global Reach / Geo Distribution
      </h3>

      {/* Stats bar */}
      <div className="mb-8 grid grid-cols-3 gap-0 border border-jet-black divide-x divide-jet-black">
        <StatBox label="NATIONS" value={String(uniqueCountries)} />
        <StatBox label="LOCATED" value={`${knownCount}/${totalContributors}`} />
        <StatBox
          label="INDEX"
          value={`${totalContributors > 0 ? Math.round((knownCount / totalContributors) * 100) : 0}%`}
        />
      </div>

      {/* Country list with bar chart */}
      <div className="space-y-4">
        {sortedCountries.slice(0, 8).map(([code, count]) => {
          const maxCount = sortedCountries[0]?.[1] ?? 1;
          const barWidth = (count / maxCount) * 100;

          return (
            <div key={code} className="group flex items-center gap-4">
              <span className="w-8 font-mono text-[10px] font-bold text-jet-black">
                {code}
              </span>
              <div className="relative h-6 flex-1 border border-jet-black bg-slate-50">
                <div
                  className="h-full bg-accent-500 transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end px-2">
                  <span className="font-mono text-[9px] font-bold text-jet-black opacity-0 group-hover:opacity-100 transition-opacity">
                    COUNT_{count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {sortedCountries.length > 8 && (
          <div className="pt-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
            [+{sortedCountries.length - 8} OVERFLOW ENTRIES]
          </div>
        )}

        {unknownCount > 0 && (
          <div className="border-t border-slate-100 pt-4 font-mono text-[9px] font-bold text-slate-400">
            {unknownCount} ENTRIES WITH ANONYMOUS LOCATION MAPPING
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 text-center">
      <p className="font-syne text-xl font-bold tracking-tighter text-jet-black">
        {value}
      </p>
      <p className="font-mono text-[9px] font-bold tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
