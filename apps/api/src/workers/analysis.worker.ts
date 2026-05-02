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
      const { owner, repo, installationId, fullAnalysis, force } = job.data;
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

        let octokit;
        if (installationId) {
          octokit = await getInstallationOctokit(installationId);
        } else {
          const { getAppOctokit } = await import("@impact/github-client");
          octokit = getAppOctokit();
        }

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
        const contributors = rawContributors.map((c) => {
          console.log(`[Analysis] Processing Contributor: "${c.login}" (Location: "${c.location}")`);
          const resolved = resolveCountry(c.location, c.login);
          console.log(`[Analysis] Result for "${c.login}": ${resolved}`);
          return {
            ...c,
            resolvedCountry: resolved,
          };
        });
        console.log(`[Analysis] Total contributors processed: ${contributors.length}`);

        // 5. Fetch community profile
        await job.updateProgress(60);
        const communityProfile = await getCommunityProfile(octokit, owner, repo);

        // 6. Store all data in PostgreSQL
        await job.updateProgress(70);
        
        const existingRepo = await prisma.repository.findUnique({
          where: { fullName },
          select: { id: true }
        });
        
        if (!existingRepo) {
          throw new Error(`Repository ${fullName} not found in database`);
        }

        const dbRepo = await prisma.repository.update({
          where: { id: existingRepo.id },
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
            hasIssueTemplate: communityProfile?.hasIssueTemplate ?? false,
            hasPullRequestTemplate: communityProfile?.hasPullRequestTemplate ?? false,
            healthPercentage: communityProfile?.healthPercentage ?? 0,
            statusMessage: "Preparing score computation...",
            contributors: {
              upsert: contributors.map((c) => ({
                where: {
                  githubLogin_repositoryId: {
                    githubLogin: c.login,
                    repositoryId: existingRepo.id,
                  },
                } as any,
                create: {
                  githubLogin: c.login,
                  rawLocation: c.location,
                  resolvedCountry: c.resolvedCountry,
                  commitCount: c.commitCount ?? 0,
                  isFirstTimer: c.isFirstTimer,
                },
                update: {
                  rawLocation: c.location,
                  resolvedCountry: c.resolvedCountry,
                  commitCount: c.commitCount ?? 0,
                },
              })),
            },
          },
        });

        // 7. Enqueue scoring job
        await job.updateProgress(90);
        const scoringQueue = getScoringQueue();
        await scoringQueue.add(`score-${fullName}`, {
          repositoryId: dbRepo.id,
          skipClassification: false,
          forceClassification: force,
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
