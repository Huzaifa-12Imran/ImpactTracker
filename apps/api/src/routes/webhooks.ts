import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { prisma } from "@impact/database";
import { getAnalysisQueue, enqueueBulkAnalysis } from "../queues/index.js";

const router: Router = Router();

/**
 * POST /api/webhooks/github
 * Receives and verifies GitHub webhook events.
 */
router.post("/github", async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  const event = req.headers["x-github-event"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;

  if (!signature || !event) {
    res.status(400).json({ error: "Missing webhook headers" });
    return;
  }

  // Verify signature
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";
  const body = JSON.stringify(req.body);
  const expectedSig = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  console.log(`[Webhook] ${event} (${deliveryId})`);

  try {
    const payload = req.body;

    switch (event) {
      case "installation": {
        await handleInstallation(payload);
        break;
      }
      case "push": {
        await handlePush(payload);
        break;
      }
      case "pull_request": {
        await handlePullRequest(payload);
        break;
      }
      case "issues": {
        await handleIssues(payload);
        break;
      }
      case "star": {
        await handleStar(payload);
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event: ${event}`);
    }

    // Store event for audit
    const repoFullName = payload.repository?.full_name;
    let repositoryId: string | null = null;

    if (repoFullName) {
      const repo = await prisma.repository.findUnique({ where: { fullName: repoFullName } });
      repositoryId = repo?.id ?? null;
    }

    await prisma.webhookEvent.create({
      data: {
        repositoryId,
        event,
        action: payload.action ?? null,
        payload: payload,
      },
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Webhook] Error processing:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

// --- Event Handlers ---

async function handleInstallation(payload: Record<string, unknown>): Promise<void> {
  const action = payload.action as string;
  const installation = payload.installation as Record<string, unknown>;
  const installId = installation.id as number;
  const account = installation.account as Record<string, unknown>;

  if (action === "created") {
    // Store installation
    await prisma.installation.upsert({
      where: { githubInstallId: installId },
      create: {
        githubInstallId: installId,
        accountLogin: account.login as string,
        accountType: account.type as string,
      },
      update: {
        accountLogin: account.login as string,
        accountType: account.type as string,
      },
    });

    // Queue analysis for all repositories
    const repos = (payload.repositories as Array<Record<string, unknown>> | undefined) ?? [];
    const repoList = repos.map((r) => {
      const fullName = r.full_name as string;
      const [owner, repo] = fullName.split("/");
      return { owner, repo };
    });

    await enqueueBulkAnalysis(repoList, installId);
    console.log(`[Webhook] Installation created: ${account.login} (${repoList.length} repos)`);

  } else if (action === "deleted") {
    await prisma.installation.deleteMany({
      where: { githubInstallId: installId },
    });
    console.log(`[Webhook] Installation deleted: ${account.login}`);
  }
}

async function handlePush(payload: Record<string, unknown>): Promise<void> {
  const repo = payload.repository as Record<string, unknown>;
  const fullName = repo.full_name as string;
  const [owner, repoName] = fullName.split("/");
  const installationId = (payload.installation as Record<string, unknown>)?.id as number | undefined;

  if (!installationId) return;

  // Debounced re-analysis: only queue if not already queued recently
  const queue = getAnalysisQueue();
  const existingJobs = await queue.getJobs(["waiting", "delayed"]);
  const alreadyQueued = existingJobs.some(
    (j) => j.data.owner === owner && j.data.repo === repoName
  );

  if (!alreadyQueued) {
    await queue.add(`push-${fullName}`, {
      owner,
      repo: repoName,
      installationId,
      fullAnalysis: false,
    }, {
      delay: 300_000, // 5-minute debounce
    });
  }
}

async function handlePullRequest(payload: Record<string, unknown>): Promise<void> {
  const action = payload.action as string;
  if (action !== "closed") return;

  const pr = payload.pull_request as Record<string, unknown>;
  if (!pr.merged) return;

  const repo = payload.repository as Record<string, unknown>;
  const fullName = repo.full_name as string;

  // Update star count while we're at it
  await prisma.repository.updateMany({
    where: { fullName },
    data: { stars: repo.stargazers_count as number },
  });
}

async function handleIssues(payload: Record<string, unknown>): Promise<void> {
  const action = payload.action as string;
  if (action !== "labeled") return;

  const label = payload.label as Record<string, unknown> | undefined;
  if (!label) return;

  const labelName = (label.name as string).toLowerCase();
  if (labelName.includes("good first issue")) {
    console.log(`[Webhook] Good first issue labeled in ${(payload.repository as Record<string, unknown>).full_name}`);
  }
}

async function handleStar(payload: Record<string, unknown>): Promise<void> {
  const repo = payload.repository as Record<string, unknown>;
  const fullName = repo.full_name as string;

  await prisma.repository.updateMany({
    where: { fullName },
    data: { stars: repo.stargazers_count as number },
  });
}

export default router;
