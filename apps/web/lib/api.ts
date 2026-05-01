/**
 * API client for the Impact Tracker backend.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((error as { error: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function getRepoScore(owner: string, repo: string) {
  return fetchAPI<import("@impact/shared").ScoreResponse>(
    `/api/repos/${owner}/${repo}/score`
  );
}

export async function getRepoHistory(owner: string, repo: string) {
  return fetchAPI<{ history: import("@impact/shared").ScoreHistoryEntry[] }>(
    `/api/repos/${owner}/${repo}/history`
  );
}

export async function getRepoContributors(owner: string, repo: string) {
  return fetchAPI<{
    totalContributors: number;
    countries: Record<string, number>;
    firstTimerCount: number;
    contributors: Array<{
      githubLogin: string;
      resolvedCountry: string | null;
      commitCount: number;
      isFirstTimer: boolean;
    }>;
  }>(`/api/repos/${owner}/${repo}/contributors`);
}

export async function getRepoStatus(owner: string, repo: string) {
  return fetchAPI<import("@impact/shared").RepoStatusResponse>(
    `/api/repos/${owner}/${repo}/status`
  );
}

export async function triggerAnalysis(owner: string, repo: string) {
  return fetchAPI<{ message: string; status: string }>(
    `/api/repos/${owner}/${repo}/analyze`,
    { method: "POST" }
  );
}

export function getBadgeUrl(owner: string, repo: string, style = "default") {
  return `${API_BASE}/api/badge/${owner}/${repo}.svg${style !== "default" ? `?style=${style}` : ""}`;
}
