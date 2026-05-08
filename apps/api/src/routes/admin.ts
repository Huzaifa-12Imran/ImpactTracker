import { Router, type Request, type Response } from "express";
import { getGitHubApp } from "@impact/github-client";
import { prisma } from "@impact/database";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Apply admin protection to all routes in this router
router.use(requireAdmin);

/**
 * @route   GET /api/admin/test-github
 * @desc    Tests GitHub App connectivity
 */
router.get("/test-github", async (_req: Request, res: Response): Promise<void> => {
  try {
    const app = getGitHubApp();
    const { data: installations } = await app.octokit.request("GET /app/installations");
    
    res.json({ 
      appId: process.env.GITHUB_APP_ID,
      installationsCount: installations.length,
      installations: installations.map((i: any) => ({
        id: i.id,
        account: i.account.login,
        type: i.account.type
      }))
    });
  } catch (error: any) {
    console.error("GitHub Test Error:", error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Check database stats
 */
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const installationCount = await prisma.installation.count();
    const repoCount = await prisma.repository.count();
    const installations = await prisma.installation.findMany({
      select: { githubInstallId: true, accountLogin: true }
    });
    const latestRepos = await prisma.repository.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { fullName: true, owner: true, installationId: true }
    });

    res.json({
      installationCount,
      repoCount,
      installations,
      latestRepos
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
