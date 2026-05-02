// GitHub App instance — handles authentication, webhooks, installations
import { App } from "@octokit/app";
import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";

const ThrottledOctokit = Octokit.plugin(throttling);

let appInstance: App | null = null;

export function getGitHubApp(): App {
  if (appInstance) return appInstance;

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!appId || !privateKey || !webhookSecret) {
    throw new Error(
      "Missing required GitHub App env vars: GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET"
    );
  }

  // Decode base64 private key if needed
  const decodedKey = privateKey.includes("BEGIN")
    ? privateKey
    : Buffer.from(privateKey, "base64").toString("utf-8");

  appInstance = new App({
    appId,
    privateKey: decodedKey,
    webhooks: { secret: webhookSecret },
    Octokit: ThrottledOctokit.defaults({
      throttle: {
        onRateLimit: (retryAfter, options, octokit) => {
          const method = options["method"] as string;
          const url = options["url"] as string;
          octokit.log.warn(`Rate limit hit for ${method} ${url}. Retrying after ${retryAfter}s`);
          return true; // retry
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          const method = options["method"] as string;
          const url = options["url"] as string;
          octokit.log.warn(`Secondary rate limit for ${method} ${url}. Retrying after ${retryAfter}s`);
          return true;
        },
      },
    }),
  });

  return appInstance;
}

import { createAppAuth } from "@octokit/auth-app";
/**
 * Get an authenticated Octokit instance for the App itself (using JWT).
 */
export function getAppOctokit(): Octokit {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  
  if (!appId || !privateKey) {
    throw new Error("Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY for App Octokit");
  }

  const decodedKey = privateKey.includes("BEGIN")
    ? privateKey
    : Buffer.from(privateKey, "base64").toString("utf-8");

  return new ThrottledOctokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey: decodedKey,
      type: "app", // Force App-level authentication
    },
    throttle: {
      onRateLimit: (retryAfter: number) => {
        console.warn(`[App Octokit] Rate limit hit. Retrying after ${retryAfter}s`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter: number) => {
        console.warn(`[App Octokit] Secondary rate limit hit. Retrying after ${retryAfter}s`);
        return true;
      },
    },
  }) as unknown as Octokit;
}

/**
 * Get an authenticated Octokit instance for a specific installation.
 */
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const app = getGitHubApp();
  return (await app.getInstallationOctokit(installationId)) as unknown as Octokit;
}
