"use client";

/**
 * Repository Impact Dashboard — /repo/[owner]/[repo]
 *
 * Shows full impact analysis with score gauge, radar chart,
 * contributor geography, score history, and badge embed.
 * Handles pending/in-progress states with skeleton UI.
 */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRepoScore, getRepoHistory, getRepoContributors } from "@lib/api";
import type { ScoreResponse, ScoreHistoryEntry } from "@impact/shared";

import ScoreGauge from "@components/ScoreGauge";
import SectorBadge from "@components/SectorBadge";
import RadarChart from "@components/RadarChart";
import WorldMap from "@components/WorldMap";
import ScoreHistory from "@components/ScoreHistory";
import DocsHealth from "@components/DocsHealth";
import BadgeEmbed from "@components/BadgeEmbed";

export default function RepoDashboard() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [contributors, setContributors] = useState<{
    totalContributors: number;
    countries: Record<string, number>;
    firstTimerCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [score, hist, contribs] = await Promise.allSettled([
        getRepoScore(owner, repo),
        getRepoHistory(owner, repo),
        getRepoContributors(owner, repo),
      ]);

      if (score.status === "fulfilled") setScoreData(score.value);
      else setError("Repository not found. Install the GitHub App first.");

      if (hist.status === "fulfilled") setHistory(hist.value.history);
      if (contribs.status === "fulfilled") setContributors(contribs.value);
    } catch {
      setError("Failed to load repository data");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for updates if analysis is in progress
  useEffect(() => {
    if (!scoreData || scoreData.repository.status === "COMPLETE") return;

    const interval = setInterval(async () => {
      try {
        const updated = await getRepoScore(owner, repo);
        setScoreData(updated);
        if (updated.repository.status === "COMPLETE") {
          clearInterval(interval);
          fetchData(); // Refresh all data
        }
      } catch {
        // Silent retry
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [scoreData, owner, repo, fetchData]);

  if (loading) return <SkeletonDashboard owner={owner} repo={repo} />;
  if (error) return <ErrorState error={error} owner={owner} repo={repo} />;
  if (!scoreData) return <ErrorState error="No data available" owner={owner} repo={repo} />;

  const isPending = scoreData.repository.status !== "COMPLETE";
  const score = scoreData.score;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-dark-500 mb-2">
          <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
          <span>/</span>
          <span>{owner}</span>
          <span>/</span>
          <span className="text-dark-300">{repo}</span>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{scoreData.repository.fullName}</h1>
            {scoreData.repository.description && (
              <p className="mt-1 text-dark-400">{scoreData.repository.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm text-dark-500">
              {scoreData.repository.language && (
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-primary-500" />
                  {scoreData.repository.language}
                </span>
              )}
              <span>⭐ {scoreData.repository.stars.toLocaleString()}</span>
            </div>
          </div>
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-dark-700 bg-dark-800/50 px-4 py-2 text-sm text-dark-300 transition-all hover:border-dark-600 hover:text-white"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>

      {/* Pending Banner */}
      {isPending && (
        <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-soft" />
            <div>
              <p className="text-sm font-medium text-amber-300">Analysis in progress</p>
              <p className="text-xs text-dark-400">
                {scoreData.repository.statusMessage ?? "Check back in a few minutes"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score Dashboard */}
      {score ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Score Gauge + Sector */}
          <div className="space-y-6">
            <div className="glass-card flex items-center justify-center p-8">
              <ScoreGauge score={score.totalScore} size={220} />
            </div>
            <SectorBadge
              sector={score.sector ?? "General Tech"}
              confidence={score.sectorConfidence ?? 0}
              sdgGoals={score.sdgGoals}
              keywords={score.sectorKeywords}
            />
          </div>

          {/* Middle column: Radar + History */}
          <div className="space-y-6">
            <RadarChart dimensions={score.dimensions} />
            <ScoreHistory history={history} />
          </div>

          {/* Right column: Map + Docs + Badge */}
          <div className="space-y-6">
            {contributors && (
              <WorldMap
                countries={contributors.countries}
                totalContributors={contributors.totalContributors}
              />
            )}
            <DocsHealth
              readmeLength={0}
              hasContributing={false}
              hasCodeOfConduct={false}
              docsScore={score.dimensions.docsAccessibility}
              maxScore={15}
            />
            <BadgeEmbed owner={owner} repo={repo} />
          </div>
        </div>
      ) : (
        <SkeletonDashboard owner={owner} repo={repo} />
      )}

      {/* Privacy note */}
      <div className="mt-12 text-center">
        <p className="text-xs text-dark-600">
          🔒 Private repo data is never shared publicly and never used to train AI models.
        </p>
      </div>
    </div>
  );
}

// --- Skeleton Loading State ---
function SkeletonDashboard({ owner, repo }: { owner: string; repo: string }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <div className="skeleton mb-2 h-4 w-32" />
        <div className="skeleton mb-2 h-8 w-64" />
        <div className="skeleton h-4 w-96" />
      </div>

      <div className="mb-6 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary-400 animate-pulse-soft" />
          <p className="text-sm text-primary-300">
            Analyzing <span className="font-semibold">{owner}/{repo}</span> — check back in a few minutes
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="glass-card flex h-72 items-center justify-center p-8">
            <div className="skeleton h-44 w-44 rounded-full" />
          </div>
          <div className="glass-card h-48 p-6">
            <div className="skeleton mb-3 h-4 w-32" />
            <div className="skeleton mb-2 h-6 w-24" />
            <div className="skeleton h-4 w-40" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-card h-72 p-6">
            <div className="skeleton mb-4 h-4 w-28" />
            <div className="skeleton mx-auto h-52 w-52 rounded-full" />
          </div>
          <div className="glass-card h-72 p-6">
            <div className="skeleton mb-4 h-4 w-28" />
            <div className="skeleton h-48 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-card h-64 p-6">
            <div className="skeleton mb-4 h-4 w-36" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton mb-2 h-5 w-full" />
            ))}
          </div>
          <div className="glass-card h-40 p-6">
            <div className="skeleton mb-3 h-4 w-36" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton mb-2 h-5 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Error State ---
function ErrorState({ error, owner, repo }: { error: string; owner: string; repo: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="glass-card p-12">
        <div className="mb-4 text-5xl">🔍</div>
        <h2 className="mb-2 text-2xl font-bold text-white">{owner}/{repo}</h2>
        <p className="mb-6 text-dark-400">{error}</p>
        <Link href="/" className="btn-primary inline-block">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
