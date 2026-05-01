import { Router, type Request, type Response } from "express";
import { prisma } from "@impact/database";
import { requireAdmin } from "../middleware/auth.js";
import { getScoringQueue } from "../queues/index.js";

const router: Router = Router();

// All admin routes require ADMIN_API_KEY
router.use(requireAdmin);

/**
 * PATCH /api/admin/sdg-weights
 * Update SDG weight overrides without redeploying.
 * Body: { "3": 1.3, "4": 1.3 }
 */
router.patch("/sdg-weights", async (req: Request, res: Response): Promise<void> => {
  const updates = req.body as Record<string, number>;

  if (!updates || typeof updates !== "object") {
    res.status(400).json({ error: "Body must be a JSON object of SDG goal → weight" });
    return;
  }

  const results: Array<{ key: string; value: number }> = [];

  for (const [goal, weight] of Object.entries(updates)) {
    const goalNum = parseInt(goal, 10);
    if (isNaN(goalNum) || goalNum < 1 || goalNum > 17) {
      res.status(400).json({ error: `Invalid SDG goal: ${goal}. Must be 1-17.` });
      return;
    }
    if (typeof weight !== "number" || weight < 0 || weight > 3) {
      res.status(400).json({ error: `Invalid weight for goal ${goal}: ${weight}. Must be 0-3.` });
      return;
    }

    await prisma.appConfig.upsert({
      where: { key: `sdg_weight_${goalNum}` },
      create: { key: `sdg_weight_${goalNum}`, value: JSON.stringify(weight) },
      update: { value: JSON.stringify(weight) },
    });

    results.push({ key: `sdg_weight_${goalNum}`, value: weight });
  }

  res.json({ updated: results });
});

/**
 * GET /api/admin/sdg-weights
 * Return all current SDG weight overrides.
 */
router.get("/sdg-weights", async (_req: Request, res: Response): Promise<void> => {
  const configs = await prisma.appConfig.findMany({
    where: { key: { startsWith: "sdg_weight_" } },
  });

  const weights: Record<string, number> = {};
  for (const config of configs) {
    const goal = config.key.replace("sdg_weight_", "");
    weights[goal] = JSON.parse(config.value) as number;
  }

  res.json({ weights });
});

/**
 * POST /api/admin/rescore-all
 * Re-run the scoring engine on all analyzed repos using updated weights.
 */
router.post("/rescore-all", async (_req: Request, res: Response): Promise<void> => {
  const repos = await prisma.repository.findMany({
    where: { status: "COMPLETE" },
    select: { id: true, fullName: true },
  });

  const queue = getScoringQueue();

  for (let i = 0; i < repos.length; i++) {
    await queue.add(`rescore-${repos[i].fullName}`, {
      repositoryId: repos[i].id,
      skipClassification: true, // Only re-score, don't re-classify
    }, {
      delay: i * 2000, // Stagger 2 seconds apart
    });
  }

  res.json({
    message: `Queued re-scoring for ${repos.length} repositories`,
    estimatedMinutes: Math.ceil((repos.length * 2) / 60),
  });
});

export default router;
