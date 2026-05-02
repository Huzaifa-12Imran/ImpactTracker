import { Router, type Request, type Response } from "express";
import { prisma } from "@impact/database";
import { classifyQueue } from "../workers/classifier";

const router = Router();

/**
 * @route   POST /api/admin/seed
 * @desc    Seeds the database with initial sector data
 * @access  Admin (Basic Auth)
 */
router.post("/seed", async (_req: Request, res: Response): Promise<void> => {
  try {
    const sectors = [
      { name: "General Tech", description: "Software development and infrastructure" },
      { name: "Education", description: "Learning and educational technology" },
      { name: "Sustainability", description: "Climate tech and green energy" },
      { name: "Healthcare", description: "Health and medical technology" }
    ];

    for (const sector of sectors) {
      await prisma.sector.upsert({
        where: { name: sector.name },
        update: {},
        create: sector
      });
    }

    res.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Failed to seed database" });
  }
});

/**
 * @route   GET /api/admin/test-github
 * @desc    Tests GitHub App connectivity
 */
router.get("/test-github", async (_req: Request, res: Response): Promise<void> => {
  try {
    const { getGitHubApp } = await import("@impact/github-client");
    const app = new (await import("octokit")).App({ 
      appId: process.env.GITHUB_APP_ID as string,
      privateKey: process.env.GITHUB_PRIVATE_KEY as string,
      webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET || "default" }
    });

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

export default router;
