import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * @route   GET /api/admin/test-github
 * @desc    Tests GitHub App connectivity
 */
router.get("/test-github", async (_req: Request, res: Response): Promise<void> => {
  try {
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
