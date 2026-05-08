// GitHub App instance — handles authentication, webhooks, installations
import { App } from "@octokit/app";
import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { createPrivateKey } from "crypto";

/**
 * Robustly sanitizes a GitHub App private key from any env-var format.
 * Handles: literal \n strings, base64 encoding, surrounding quotes, extra spaces.
 */
function sanitizePrivateKey(raw: string): string {
  // 1. Remove surrounding quotes if present
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // 2. Replace literal \n sequences with real newlines
  key = key.replace(/\\n/g, "\n");

  // 3. If still no newlines and looks like base64, decode it
  if (!key.includes("\n") && !key.includes("BEGIN")) {
    try {
      key = Buffer.from(key, "base64").toString("utf-8");
    } catch {
      // not base64, leave as-is
    }
  }

  // 4. Normalize: ensure PEM headers are on their own lines
  key = key
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "-----BEGIN RSA PRIVATE KEY-----\n")
    .replace(/-----END RSA PRIVATE KEY-----/g, "\n-----END RSA PRIVATE KEY-----")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "-----BEGIN PRIVATE KEY-----\n")
    .replace(/-----END PRIVATE KEY-----/g, "\n-----END PRIVATE KEY-----")
    .replace(/\n{2,}/g, "\n") // collapse multiple newlines
    .trim();

  return key;
}

/**
 * Converts a PKCS#1 RSA private key (-----BEGIN RSA PRIVATE KEY-----)
 * to PKCS#8 format (-----BEGIN PRIVATE KEY-----) which Node 18+ prefers.
 * If already PKCS#8, returns as-is.
 */
function ensurePkcs8(pem: string): string {
  if (pem.includes("BEGIN PRIVATE KEY")) return pem; // already PKCS#8
  try {
    const keyObj = createPrivateKey({ key: pem, format: "pem" });
    return keyObj.export({ type: "pkcs8", format: "pem" }) as string;
  } catch (err) {
    console.warn("[GitHub App] Could not convert key to PKCS#8, using as-is:", (err as Error).message);
    return pem;
  }
}

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

  const decodedKey = ensurePkcs8(sanitizePrivateKey(privateKey));
  console.log(`[GitHub App] Key format: ${decodedKey.includes("BEGIN PRIVATE KEY") ? "PKCS#8" : "PKCS#1"}, starts with: ${decodedKey.substring(0, 40).replace(/\n/g, "↵")}`);

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
    throw new Error("Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY");
  }

  const finalKey = ensurePkcs8(sanitizePrivateKey(privateKey));

  // Stage 1: Create an auth instance to get the JWT
  const auth = createAppAuth({
    appId,
    privateKey: finalKey,
  });

  // Stage 2: Return a throttled Octokit that uses the JWT as a static token
  // This prevents Octokit from trying to "find" an installation ID
  return new ThrottledOctokit({
    authStrategy: () => auth({ type: "app" }), 
    throttle: {
      onRateLimit: (retryAfter: number) => {
        console.warn(`[GitHub App] Rate limit hit, retrying after ${retryAfter}s`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter: number) => {
        console.warn(`[GitHub App] Secondary rate limit hit, retrying after ${retryAfter}s`);
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
