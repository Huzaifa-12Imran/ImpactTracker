import { Queue } from "bullmq";
import { getRedis } from "../lib/redis.js";

export interface AnalysisJobData {
  owner: string;
  repo: string;
  installationId: number | null;
  fullAnalysis: boolean; // true = first-time, false = incremental
  force?: boolean;
  forceClassification?: boolean;
}

export interface ScoringJobData {
  repositoryId: string;
  skipClassification: boolean; // true if content hash unchanged
  forceClassification?: boolean; // true to bypass hash check
}

let analysisQueue: Queue<AnalysisJobData> | null = null;
let scoringQueue: Queue<ScoringJobData> | null = null;

export function getAnalysisQueue(): Queue<AnalysisJobData> {
  if (analysisQueue) return analysisQueue;

  analysisQueue = new Queue<AnalysisJobData>("repo-analysis", {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });

  return analysisQueue;
}

export function getScoringQueue(): Queue<ScoringJobData> {
  if (scoringQueue) return scoringQueue;

  scoringQueue = new Queue<ScoringJobData>("impact-scoring", {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });

  return scoringQueue;
}

/**
 * Enqueue analysis jobs with staggered delays for bulk installs.
 * If > 20 repos, each job gets a 30-second delay offset.
 */
export async function enqueueBulkAnalysis(
  repos: Array<{ owner: string; repo: string }>,
  installationId: number
): Promise<void> {
  const queue = getAnalysisQueue();
  const threshold = 20;
  const delayPerJob = 30_000; // 30 seconds

  for (let i = 0; i < repos.length; i++) {
    const delay = repos.length > threshold ? i * delayPerJob : 0;

    await queue.add(
      `analyze-${repos[i].owner}-${repos[i].repo}`,
      {
        owner: repos[i].owner,
        repo: repos[i].repo,
        installationId,
        fullAnalysis: true,
      },
      { delay }
    );
  }

  console.log(
    `[Queue] Enqueued ${repos.length} analysis jobs` +
    (repos.length > threshold ? ` (staggered over ${Math.round(repos.length * delayPerJob / 60000)}min)` : "")
  );
}
