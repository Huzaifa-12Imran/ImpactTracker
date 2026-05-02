/**
 * Analysis Worker
 *
 * Processes repo analysis jobs from BullMQ queue.
 * Full pipeline: fetch data → resolve locations → store → enqueue scoring.
 */
import { Worker, type Job } from "bullmq";
import { prisma } from "@impact/database";
import { getInstallationOctokit, getRepo, getContributors, getReadme, getCommunityProfile } from "@impact/github-client";
import { resolveCountry } from "@impact/shared";
import { getRedis } from "../lib/redis.js";
import { getScoringQueue, type AnalysisJobData } from "../queues/index.js";

export function startAnalysisWorker(): Worker<AnalysisJobData> {
  const worker = new Worker<AnalysisJobData>(
    "repo-analysis",
    async (job: Job<AnalysisJobData>) => {
      const { owner, repo, installationId, fullAnalysis } = job.data;
      const fullName = `${owner}/${repo}`;

      console.log(`[Analysis] Starting ${fullAnalysis ? "full" : "incremental"} analysis: ${fullName}`);

      try {
        // Update status
        await prisma.repository.upsert({
          where: { fullName },
          create: {
            githubId: 0, // Will be updated below
            owner,
            name: repo,
            fullName,
            installationId,
            status: "IN_PROGRESS",
            statusMessage: "Fetching repository data...",
          },
          update: {
            status: "IN_PROGRESS",
            statusMessage: "Fetching repository data...",
            installationId,
          },
        });

        const octokit = await getInstallationOctokit(installationId);

        // 1. Fetch repo metadata
        await job.updateProgress(10);
        const metadata = await getRepo(octokit, owner, repo);

        // 2. Fetch README
        await job.updateProgress(20);
        const readmeContent = await getReadme(octokit, owner, repo);

        // 3. Fetch contributors with locations
        await job.updateProgress(30);
        await prisma.repository.update({
          where: { fullName },
          data: { statusMessage: "Analyzing contributors..." },
        });
        const rawContributors = await getContributors(octokit, owner, repo);

        // 4. Resolve contributor locations → country codes (3-tier strategy)
        await job.updateProgress(50);
        const contributors = rawContributors.map((c) => ({
          ...c,
          resolvedCountry: resolveCountry(c.location),
        }));

        // 5. Fetch community profile
        await job.updateProgress(60);
        const communityProfile = await getCommunityProfile(octokit, owner, repo);

        // 6. Store all data in PostgreSQL
        await job.updateProgress(70);
        await prisma.repository.update({
          where: { fullName },
          data: {
            statusMessage: "Storing analysis data...",
          },
        });

        const dbRepo = await prisma.repository.update({
          where: { fullName },
          data: {
            githubId: metadata.githubId,
            description: metadata.description,
            topics: metadata.topics,
            language: metadata.language,
            stars: metadata.stars,
            license: metadata.license,
            readmeContent,
            hasContributing: communityProfile?.hasContributing ?? false,
            hasCodeOfConduct: communityProfile?.hasCodeOfConduct ?? false,
            statusMessage: "Preparing score computation...",
          },
        });

        // Upsert contributors
        for (const contrib of contributors) {
          await prisma.contributor.upsert({
            where: {
              githubLogin_repositoryId: {
                githubLogin: contrib.login,
                repositoryId: dbRepo.id,
              },
            },
            create: {
              githubLogin: contrib.login,
              repositoryId: dbRepo.id,
              rawLocation: contrib.location,
              resolvedCountry: contrib.resolvedCountry,
              commitCount: contrib.commitCount,
              isFirstTimer: contrib.isFirstTimer,
            },
            update: {
              rawLocation: contrib.location,
              resolvedCountry: contrib.resolvedCountry,
              commitCount: contrib.commitCount,
            },
          });
        }

        // 7. Enqueue scoring job
        await job.updateProgress(90);
        const scoringQueue = getScoringQueue();
        await scoringQueue.add(`score-${fullName}`, {
          repositoryId: dbRepo.id,
          skipClassification: false,
          forceClassification: job.data.force,
        });

        await job.updateProgress(100);
        console.log(`[Analysis] Completed: ${fullName} (${contributors.length} contributors)`);

      } catch (error) {
        console.error(`[Analysis] Failed: ${fullName}`, error);

        await prisma.repository.updateMany({
          where: { fullName },
          data: {
            status: "FAILED",
            statusMessage: `Analysis failed: ${(error as Error).message}`,
          },
        });

        throw error; // Let BullMQ handle retry
      }
    },
    {
      connection: getRedis(),
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60_000, // Max 10 jobs per minute
      },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Analysis Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Analysis Worker] Job ${job.id} completed`);
  });

  return worker;
}
