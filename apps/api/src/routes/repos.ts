import { Router, type Request, type Response } from "express";
import { prisma } from "@impact/database";
import { getAnalysisQueue } from "../queues/index.js";
import type { ScoreResponse, ScoreHistoryEntry, RepoStatusResponse } from "@impact/shared";

const router: Router = Router();

/**
 * GET /api/repos/:owner/:repo/score
 * Return the current impact score for a repository.
 */
router.get("/:owner/:repo/score", async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  const repository = await prisma.repository.findUnique({
    where: { fullName },
    include: {
      impactScores: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!repository) {
    res.status(404).json({ error: "Repository not found. Install the GitHub App first." });
    return;
  }

  const latestScore = repository.impactScores[0] ?? null;

  const response: ScoreResponse = {
    repository: {
      owner: repository.owner,
      name: repository.name,
      fullName: repository.fullName,
      description: repository.description,
      stars: repository.stars,
      language: repository.language,
      status: repository.status,
      statusMessage: repository.statusMessage,
    },
    score: latestScore
      ? {
          totalScore: latestScore.totalScore,
          dimensions: {
            sectorRelevance: latestScore.sectorRelevance,
            contributorGeography: latestScore.contributorGeography,
            firstTimerOnboarding: latestScore.firstTimerOnboarding,
            docsAccessibility: latestScore.docsAccessibility,
            communityHealth: latestScore.communityHealth,
          },
          sector: latestScore.sector as ScoreResponse["score"] extends null ? never : NonNullable<ScoreResponse["score"]>["sector"],
          sectorConfidence: latestScore.sectorConfidence,
          sdgGoals: latestScore.sdgGoals,
          sectorKeywords: latestScore.sectorKeywords,
          contributorCountries: (latestScore.contributorCountries as Record<string, number>) ?? {},
          firstTimerCount: latestScore.firstTimerCount,
          totalContributors: latestScore.totalContributors,
          lastAnalyzedAt: repository.lastAnalyzedAt?.toISOString() ?? null,
        }
      : null,
  };

  res.json(response);
});

/**
 * GET /api/repos/:owner/:repo/history
 * Return score history over time.
 */
router.get("/:owner/:repo/history", async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  const repository = await prisma.repository.findUnique({
    where: { fullName },
  });

  if (!repository) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }

  const scores = await prisma.impactScore.findMany({
    where: { repositoryId: repository.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const history: ScoreHistoryEntry[] = scores.map((s) => ({
    totalScore: s.totalScore,
    dimensions: {
      sectorRelevance: s.sectorRelevance,
      contributorGeography: s.contributorGeography,
      firstTimerOnboarding: s.firstTimerOnboarding,
      docsAccessibility: s.docsAccessibility,
      communityHealth: s.communityHealth,
    },
    createdAt: s.createdAt.toISOString(),
  }));

  res.json({ history });
});

/**
 * GET /api/repos/:owner/:repo/contributors
 * Return contributor geography data.
 */
router.get("/:owner/:repo/contributors", async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  const repository = await prisma.repository.findUnique({
    where: { fullName },
  });

  if (!repository) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }

  const contributors = await prisma.contributor.findMany({
    where: { repositoryId: repository.id },
    select: {
      githubLogin: true,
      resolvedCountry: true,
      commitCount: true,
      isFirstTimer: true,
    },
    orderBy: { commitCount: "desc" },
  });

  // Build country summary
  const countryCounts: Record<string, number> = {};
  for (const c of contributors) {
    const country = c.resolvedCountry ?? "Unknown";
    countryCounts[country] = (countryCounts[country] ?? 0) + 1;
  }

  res.json({
    totalContributors: contributors.length,
    countries: countryCounts,
    firstTimerCount: contributors.filter((c) => c.isFirstTimer).length,
    contributors: contributors.slice(0, 50), // Limit to top 50
  });
});

/**
 * GET /api/repos/:owner/:repo/status
 * Return analysis status (for polling from dashboard).
 */
router.get("/:owner/:repo/status", async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  const repository = await prisma.repository.findUnique({
    where: { fullName },
    select: {
      status: true,
      statusMessage: true,
      lastAnalyzedAt: true,
      createdAt: true,
    },
  });

  if (!repository) {
    res.status(404).json({ error: "Repository not found" });
    return;
  }

  const response: RepoStatusResponse = {
    status: repository.status,
    statusMessage: repository.statusMessage,
    queuedAt: repository.createdAt.toISOString(),
    lastAnalyzedAt: repository.lastAnalyzedAt?.toISOString() ?? null,
  };

  res.json(response);
});

/**
 * POST /api/repos/:owner/:repo/analyze
 * Trigger manual re-analysis.
 */
router.post("/:owner/:repo/analyze", async (req: Request, res: Response): Promise<void> => {
  const owner = Array.isArray(req.params.owner) ? req.params.owner[0] : req.params.owner;
  const repo = Array.isArray(req.params.repo) ? req.params.repo[0] : req.params.repo;
  const fullName = `${owner}/${repo}`;

  const repository = await prisma.repository.findUnique({
    where: { fullName },
  });

  if (!repository || !repository.installationId) {
    res.status(404).json({ error: "Repository not found or app not installed" });
    return;
  }

  const queue = getAnalysisQueue();
  await queue.add(`manual-${fullName}`, {
    owner,
    repo,
    installationId: repository.installationId,
    fullAnalysis: true,
  });

  await prisma.repository.update({
    where: { id: repository.id },
    data: { status: "IN_PROGRESS", statusMessage: "Manual re-analysis triggered" },
  });

  res.json({ message: "Analysis queued", status: "IN_PROGRESS" });
});

export default router;
