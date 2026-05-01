import { Router, type Request, type Response } from "express";
import { prisma } from "@impact/database";
import { generateBadge } from "@impact/badge";
import type { Sector, BadgeStyle } from "@impact/shared";
import { BADGE_DEFAULTS } from "@impact/shared";
import { getRedis } from "../lib/redis.js";

const router: Router = Router();

/**
 * GET /api/badge/:owner/:repo.svg
 * Return a dynamic SVG impact badge.
 * Supports ?style=default|flat|sdg
 */
router.get("/:owner/:repo.svg", async (req: Request, res: Response): Promise<void> => {
  const { owner, repo } = req.params;
  const style = (req.query.style as BadgeStyle) ?? "default";
  const fullName = `${owner}/${repo}`;

  // Check Redis cache first
  const cacheKey = `badge:${owner}:${repo}:${style}`;
  const redis = getRedis();

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", `public, max-age=${BADGE_DEFAULTS.cacheControlMaxAge}`);
      res.send(cached);
      return;
    }
  } catch {
    // Redis error — fall through to generate
  }

  // Fetch latest score
  const repository = await prisma.repository.findUnique({
    where: { fullName },
    include: {
      impactScores: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const latestScore = repository?.impactScores[0] ?? null;

  const svg = generateBadge({
    score: latestScore?.totalScore ?? null,
    sector: (latestScore?.sector as Sector) ?? null,
    sdgGoals: latestScore?.sdgGoals ?? [],
    style,
  });

  // Cache in Redis
  try {
    await redis.setex(cacheKey, BADGE_DEFAULTS.cacheTtlSeconds, svg);
  } catch {
    // Cache write failed — non-fatal
  }

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", `public, max-age=${BADGE_DEFAULTS.cacheControlMaxAge}`);
  res.send(svg);
});

export default router;
