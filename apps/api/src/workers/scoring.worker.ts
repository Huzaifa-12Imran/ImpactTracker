/**
 * Scoring Worker
 *
 * Computes impact scores using the scoring engine.
 * Handles content hash change detection to skip unnecessary AI calls.
 */
import { Worker, type Job } from "bullmq";
import { prisma } from "@impact/database";
import { classifyRepo } from "@impact/classifier";
import { computeImpactScore } from "@impact/scorer";
import { computeContentHash } from "@impact/shared";
import type { Sector, SDGGoal } from "@impact/shared";
import { getRedis } from "../lib/redis.js";
import type { ScoringJobData } from "../queues/index.js";

/**
 * Load SDG weight overrides from AppConfig table.
 */
async function loadSDGWeightOverrides(): Promise<Record<number, number>> {
  const configs = await prisma.appConfig.findMany({
    where: { key: { startsWith: "sdg_weight_" } },
  });

  const overrides: Record<number, number> = {};
  for (const config of configs) {
    const goal = parseInt(config.key.replace("sdg_weight_", ""), 10);
    if (!isNaN(goal)) {
      overrides[goal] = JSON.parse(config.value) as number;
    }
  }
  return overrides;
}

export function startScoringWorker(): Worker<ScoringJobData> {
  const worker = new Worker<ScoringJobData>(
    "impact-scoring",
    async (job: Job<ScoringJobData>) => {
      const { repositoryId, skipClassification } = job.data;

      const repo = await prisma.repository.findUnique({
        where: { id: repositoryId },
        include: {
          contributors: true,
          impactScores: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!repo) {
        throw new Error(`Repository ${repositoryId} not found`);
      }

      console.log(`[Scoring] Processing: ${repo.fullName}`);

      await prisma.repository.update({
        where: { id: repositoryId },
        data: { statusMessage: "Computing impact score..." },
      });

      // Check content hash for change detection
      const currentHash = computeContentHash(repo.readmeContent, repo.topics);
      const previousHash = repo.impactScores[0]?.contentHash;
      const contentChanged = currentHash !== previousHash;

      // Classification
      let sector: Sector = "General Tech";
      let sectorConfidence = 0;
      let sdgGoals: SDGGoal[] = [9];
      let sectorKeywords: string[] = [];

      if (skipClassification && repo.impactScores[0]) {
        // Re-score only: reuse existing classification
        sector = (repo.impactScores[0].sector as Sector) ?? "General Tech";
        sectorConfidence = repo.impactScores[0].sectorConfidence ?? 0;
        sdgGoals = (repo.impactScores[0].sdgGoals ?? [9]) as SDGGoal[];
        sectorKeywords = repo.impactScores[0].sectorKeywords ?? [];
      } else if (job.data.forceClassification || contentChanged || !repo.impactScores[0]) {
        // Content changed or first-time: run AI classification
        await prisma.repository.update({
          where: { id: repositoryId },
          data: { statusMessage: "Classifying project sector with AI..." },
        });

        const classification = await classifyRepo({
          fullName: repo.fullName,
          description: repo.description,
          topics: repo.topics,
          language: repo.language,
          readmeExcerpt: repo.readmeContent,
        });

        if (classification) {
          sector = classification.sector;
          sectorConfidence = classification.confidence;
          sdgGoals = classification.sdgGoals;
          sectorKeywords = classification.keywords;
          console.log(`[Scoring] Classified as ${sector} (${classification.source}, confidence: ${sectorConfidence})`);
        } else {
          // All classifiers failed — mark as pending for retry
          console.warn(`[Scoring] Classification failed for ${repo.fullName}, defaulting to General Tech`);
        }
      } else {
        // Content unchanged: reuse existing classification
        sector = (repo.impactScores[0]?.sector as Sector) ?? "General Tech";
        sectorConfidence = repo.impactScores[0]?.sectorConfidence ?? 0;
        sdgGoals = (repo.impactScores[0]?.sdgGoals ?? [9]) as SDGGoal[];
        sectorKeywords = repo.impactScores[0]?.sectorKeywords ?? [];
        console.log(`[Scoring] Content unchanged — reusing classification: ${sector}`);
      }

      // Load SDG weight overrides from DB
      const sdgWeightOverrides = await loadSDGWeightOverrides();

      // Compute full impact score
      const scoreResult = computeImpactScore({
        sector,
        sectorConfidence,
        sdgGoals,
        sectorKeywords,
        sdgWeightOverrides,
        contributors: repo.contributors.map((c) => ({
          resolvedCountry: c.resolvedCountry,
          isFirstTimer: c.isFirstTimer,
        })),
        readmeContent: repo.readmeContent,
        topics: repo.topics,
        hasContributing: false, // TODO: fetch from community profile
        hasCodeOfConduct: false,
        communityProfile: null,
        avgIssueResponseHours: null,
        prMergeRate: null,
        lastActivityDate: repo.updatedAt,
      });

      // Build country map for storage
      const countryCounts: Record<string, number> = {};
      for (const c of repo.contributors) {
        const country = c.resolvedCountry ?? "Unknown";
        countryCounts[country] = (countryCounts[country] ?? 0) + 1;
      }

      // Store score
      await prisma.impactScore.create({
        data: {
          repositoryId,
          totalScore: scoreResult.totalScore,
          sectorRelevance: scoreResult.sectorRelevance,
          contributorGeography: scoreResult.contributorGeography,
          firstTimerOnboarding: scoreResult.firstTimerOnboarding,
          docsAccessibility: scoreResult.docsAccessibility,
          communityHealth: scoreResult.communityHealth,
          sector: scoreResult.sector,
          sectorConfidence: scoreResult.sectorConfidence,
          sdgGoals: scoreResult.sdgGoals,
          sectorKeywords: scoreResult.sectorKeywords,
          contributorCountries: countryCounts,
          firstTimerCount: repo.contributors.filter((c) => c.isFirstTimer).length,
          totalContributors: repo.contributors.length,
          contentHash: currentHash,
        },
      });

      // Mark analysis complete
      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          status: "COMPLETE",
          statusMessage: null,
          lastAnalyzedAt: new Date(),
        },
      });

      // Invalidate badge cache
      try {
        const redis = getRedis();
        const patterns = [
          `badge:${repo.owner}:${repo.name}:*`,
        ];
        for (const pattern of patterns) {
          const keys = await redis.keys(pattern);
          if (keys.length > 0) await redis.del(...keys);
        }
      } catch {
        // Cache invalidation failed — non-fatal
      }

      console.log(`[Scoring] Complete: ${repo.fullName} → ${scoreResult.totalScore}/100 (${sector})`);
    },
    {
      connection: getRedis(),
      concurrency: 3,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Scoring Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
