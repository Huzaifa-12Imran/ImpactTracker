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

      if (score.status === "fulfilled") {
        setScoreData(score.value);
        setError(null);
      } else {
        const errorMsg = (score.reason as Error).message;
        setError(errorMsg.includes("Install the GitHub App") ? errorMsg : "Repository not found or analysis failed");
      }

      if (hist.status === "fulfilled") setHistory(hist.value.history);
      if (contribs.status === "fulfilled") setContributors(contribs.value);
    } catch (err) {
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
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-12 border-l-4 border-jet-black pl-8">
        <div className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
          <Link href="/" className="hover:text-primary-600 transition-colors">ROOT</Link>
          <span>/</span>
          <span>{owner.toUpperCase()}</span>
          <span>/</span>
          <span className="text-jet-black">{repo.toUpperCase()}</span>
        </div>
        
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-syne text-5xl font-bold tracking-tighter text-jet-black mb-2">
              {scoreData.repository.fullName.split('/')[1]}
            </h1>
            {scoreData.repository.description && (
              <p className="font-sans text-sm font-medium text-slate-500 leading-relaxed">
                {scoreData.repository.description}
              </p>
            )}
            <div className="mt-6 flex items-center gap-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-jet-black">
              {scoreData.repository.language && (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary-600" />
                  {scoreData.repository.language}
                </span>
              )}
              <span>STARS_{scoreData.repository.stars.toLocaleString()}</span>
              <a
                href={`https://github.com/${owner}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 transition-colors"
              >
                [VIEW_SOURCE]
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Banner */}
      {isPending && (
        <div className="mb-12 border border-jet-black bg-accent-500/10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          {/* Subtle scanning line animation */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-0 bottom-0 w-px bg-accent-500 animate-[move-x_4s_linear_infinite]" />
          </div>

          <div className="flex items-center gap-6 z-10">
            <div className="relative">
              <div className="h-4 w-4 bg-accent-500 rounded-full animate-ping opacity-75 absolute" />
              <div className="h-4 w-4 bg-accent-500 rounded-full relative" />
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-accent-600 mb-1">
                System_Status: Scanning
              </div>
              <div className="font-syne text-lg font-bold uppercase tracking-tighter text-jet-black">
                {scoreData.repository.statusMessage?.replace(/_/g, ' ') ?? "POLLING DATA STREAMS"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 z-10">
            <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-accent-500 animate-[draw-line_2s_ease-in-out_infinite]" />
            </div>
            <span className="font-mono text-[9px] font-bold text-slate-400">SYNC_V1.2</span>
          </div>
        </div>
      )}

      {/* Score Dashboard */}
      {score ? (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Main Stats */}
          <div className="lg:col-span-4 space-y-4">
            <div className="console-card flex items-center justify-center p-12 bg-white">
              <ScoreGauge score={score.totalScore} size={240} />
            </div>
            <SectorBadge
              sector={score.sector ?? "General Tech"}
              confidence={score.sectorConfidence ?? 0}
              sdgGoals={score.sdgGoals}
              keywords={score.sectorKeywords}
            />
          </div>

          {/* Visualization Column */}
          <div className="lg:col-span-4 space-y-4">
            <RadarChart dimensions={score.dimensions} />
            <ScoreHistory history={history} />
          </div>

          {/* Data Column */}
          <div className="lg:col-span-4 space-y-4">
            {contributors && (
              <WorldMap
                countries={contributors.countries}
                totalContributors={contributors.totalContributors}
              />
            )}
            <DocsHealth
              readmeLength={scoreData.repository.readmeLength}
              hasContributing={scoreData.repository.hasContributing}
              hasCodeOfConduct={scoreData.repository.hasCodeOfConduct}
              docsScore={score.dimensions.docsAccessibility}
              maxScore={15}
            />
            <BadgeEmbed owner={owner} repo={repo} />
          </div>
        </div>
      ) : (
        <SkeletonGrid />
      )}

      {/* Footer Meta */}
      <div className="mt-20 border-t border-slate-100 pt-8 text-center">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300">
          PROTECTED DATA STREAM // NO AI TRAINING LOGS GENERATED
        </p>
      </div>
    </div>
  );
}

// --- Skeleton Loading State ---
function SkeletonDashboard({ owner, repo }: { owner: string; repo: string }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12 border-l-4 border-slate-100 pl-8">
        <div className="skeleton mb-4 h-3 w-40" />
        <div className="skeleton mb-4 h-12 w-80" />
        <div className="skeleton h-4 w-96" />
      </div>

      <SkeletonGrid />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4 space-y-6">
        <div className="console-card h-80 bg-white flex flex-col items-center justify-center p-8">
          <div className="skeleton h-48 w-48 rounded-full mb-6" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="console-card h-64 bg-slate-50 border-dashed border-slate-300 flex items-center justify-center">
          <div className="font-mono text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            Awaiting_classification_results
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="console-card h-80 bg-slate-50 border-dashed border-slate-300 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-2 w-32 skeleton" />
            <div className="h-2 w-24 skeleton" />
            <div className="h-2 w-40 skeleton" />
          </div>
        </div>
        <div className="console-card h-64 bg-slate-50 border-dashed border-slate-300 flex items-center justify-center">
           <div className="font-mono text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            Gathering_history_nodes
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="console-card h-80 bg-slate-50 border-dashed border-slate-300 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="h-24 w-40 skeleton" />
             <div className="font-mono text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              Mapping_geography
            </div>
          </div>
        </div>
        <div className="console-card h-64 bg-slate-50 border-dashed border-slate-300 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-4 w-32" />
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
      <div className="console-card p-16 border-red-500">
        <div className="mb-6 font-mono text-3xl font-bold text-red-500">ERROR_404</div>
        <h2 className="mb-4 font-syne text-2xl font-bold tracking-tighter text-jet-black">{owner.toUpperCase()} / {repo.toUpperCase()}</h2>
        <p className="mb-10 font-sans text-sm font-medium text-slate-500">{error.toUpperCase()}</p>
        <Link href="/" className="btn-primary">
          ← TERMINATE & RETURN
        </Link>
      </div>
    </div>
  );
}
