"use client";

/**
 * User Dashboard — /dashboard
 * Shows all repos with the app installed and their scores.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Your Repositories</h1>
        <p className="mt-1 text-dark-400">
          Impact scores for all repositories with the GitHub App installed.
        </p>
      </div>

      {/* Placeholder — in production this fetches from API */}
      <div className="glass-card p-12 text-center">
        <div className="mb-4 text-5xl">📊</div>
        <h2 className="mb-2 text-xl font-semibold text-white">No repositories yet</h2>
        <p className="mb-6 text-dark-400">
          Install the Impact Tracker GitHub App on your repositories to see their scores here.
        </p>
        <a
          href="https://github.com/apps/impact-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block"
        >
          Install GitHub App
        </a>
      </div>
    </div>
  );
}
