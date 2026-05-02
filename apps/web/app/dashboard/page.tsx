"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Repository {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  status: string;
  score: number | null;
  sector: string | null;
}

/**
 * User Dashboard — /dashboard
 * Shows all repos with the app installed and their scores.
 */
export default function DashboardPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/repos`);
      const data = await res.json();
      setRepos(data);
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      await fetch(`${apiUrl}/api/repos/sync`, { method: "POST" });
      await fetchRepos();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-syne text-3xl font-bold uppercase tracking-tighter text-jet-black">Your Repositories</h1>
          <p className="mt-1 font-sans text-sm font-medium text-slate-500">
            Impact scores for all repositories with the GitHub App installed.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary border-jet-black bg-white text-jet-black hover:bg-slate-50 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync All Repos"}
          </button>
          <a
            href="https://github.com/apps/impacttrackerbyhuz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Add More Repos
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : repos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <Link
              key={repo.fullName}
              href={`/repo/${repo.fullName}`}
              className="console-card group bg-white p-6 transition-all hover:border-primary-600"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center bg-slate-100 font-syne text-lg font-bold text-jet-black">
                  {repo.owner[0].toUpperCase()}
                </div>
                {repo.score !== null && (
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-jet-black bg-primary-600 font-syne text-sm font-bold text-jet-black">
                    {Math.round(repo.score)}
                  </div>
                )}
              </div>
              <h3 className="mb-1 font-syne text-lg font-bold tracking-tight text-jet-black group-hover:text-primary-600">
                {repo.fullName}
              </h3>
              <p className="mb-4 line-clamp-2 min-h-[40px] font-sans text-xs font-medium text-slate-500">
                {repo.description || "No description provided."}
              </p>
              <div className="flex items-center gap-4 border-t border-slate-100 pt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>⭐ {repo.stars}</span>
                <span>{repo.language || "Unknown"}</span>
                <span className="ml-auto text-primary-600">{repo.sector || repo.status}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="console-card p-20 text-center">
          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-4xl">
            📊
          </div>
          <h2 className="mb-2 font-syne text-2xl font-bold uppercase tracking-tighter text-jet-black">No repositories detected</h2>
          <p className="mb-8 mx-auto max-w-sm font-sans text-sm font-medium text-slate-500">
            Install the GitHub App on your repositories to see their social impact scores here.
          </p>
          <a
            href="https://github.com/apps/impacttrackerbyhuz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Install GitHub App
          </a>
        </div>
      )}
    </div>
  );
}
