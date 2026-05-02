import { Router, type Request, type Response } from "express";
import { prisma } from "@impact/database";
import { getAnalysisQueue } from "../queues/index.js";
import type { ScoreResponse, ScoreHistoryEntry, RepoStatusResponse, AnalysisStatus } from "@impact/shared";

const router: Router = Router();

/**
 * GET /api/repos
 * Return all repositories with their latest scores.
 */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const repos = await prisma.repository.findMany({
    include: {
      impactScores: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { fullName: "asc" },
  });

  const response = repos.map((r) => ({
    owner: r.owner,
    name: r.name,
    fullName: r.fullName,
    description: r.description,
    stars: r.stars,
    language: r.language,
    status: r.status,
    score: r.impactScores[0]?.totalScore ?? null,
    sector: r.impactScores[0]?.sector ?? null,
  }));

  res.json(response);
});

/**
 * POST /api/repos/sync
 * Manually sync all installations and repositories from GitHub.
 */
router.post("/sync", async (req: Request, res: Response): Promise<void> => {
  try {
    const force = req.query.force === "true";
    console.log(`[Sync] Starting manual sync... (Force: ${force})`);
    const { getGitHubApp } = await import("@impact/github-client");
    const app = getGitHubApp();
    console.log("[Sync] App instance created. Fetching installations...");
    const { data: installations } = await app.octokit.request("GET /app/installations");
    console.log(`[Sync] Found ${installations.length} installations.`);

    let syncedCount = 0;

    for (const installation of installations) {
      const installId = installation.id;
      const accountLogin = installation.account?.login ?? "unknown";
      const accountType = installation.account?.type ?? "unknown";
      console.log(`[Sync] Processing installation ${installId} for ${accountLogin}...`);

      await prisma.installation.upsert({
        where: { githubInstallId: installId },
        update: {
          accountLogin,
          accountType,
        },
        create: {
          githubInstallId: installId,
          accountLogin,
          accountType,
        },
      });

      console.log(`[Sync] Fetching repositories for installation ${installId}...`);
      const octokit = await app.getInstallationOctokit(installId);
      const { data: { repositories } } = await octokit.request("GET /installation/repositories");
      console.log(`[Sync] Found ${repositories.length} repositories for ${accountLogin}.`);

      const analysisQueue = (await import("../queues/index.js")).getAnalysisQueue();
      for (const repoData of repositories) {
        console.log(`[Sync] Upserting & Enqueueing repo: ${repoData.full_name} (Force: ${force})`);
        await prisma.repository.upsert({
          where: { fullName: repoData.full_name },
          update: {
            githubId: repoData.id,
            description: repoData.description,
            stars: repoData.stargazers_count,
            language: repoData.language,
            installationId: installId,
          },
          create: {
            fullName: repoData.full_name,
            githubId: repoData.id,
            owner: repoData.owner.login,
            name: repoData.name,
            description: repoData.description,
            stars: repoData.stargazers_count,
            language: repoData.language,
            installationId: installId,
            status: "PENDING",
          },
        });

        // Add to analysis queue
        await analysisQueue.add(`sync-${repoData.full_name}`, {
          owner: repoData.owner.login,
          repo: repoData.name,
          installationId: installId,
          fullAnalysis: true,
          forceClassification: force,
        });

        syncedCount++;
      }
    }

    console.log(`[Sync] Completed. Synced ${syncedCount} total repositories.`);
    res.json({ message: `Successfully synced ${syncedCount} repositories from ${installations.length} installations.` });
  } catch (error) {
    console.error("[Sync] Error during manual sync:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

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
      status: repository.status as AnalysisStatus,
      statusMessage: repository.statusMessage,
      readmeLength: repository.readmeContent?.length ?? 0,
      hasContributing: repository.hasContributing,
      hasCodeOfConduct: repository.hasCodeOfConduct,
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
          classificationSource: (latestScore.classificationSource as any) ?? "rule-based",
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
  const force = req.query.force === "true";
  await queue.add(`manual-${fullName}`, {
    owner,
    repo,
    installationId: repository.installationId,
    fullAnalysis: true,
    force,
  });

  await prisma.repository.update({
    where: { id: repository.id },
    data: { status: "IN_PROGRESS", statusMessage: "Manual re-analysis triggered" },
  });

  res.json({ message: "Analysis queued", status: "IN_PROGRESS" });
});

export default router;
