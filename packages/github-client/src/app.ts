// GitHub App instance — handles authentication, webhooks, installations
import { App } from "@octokit/app";
import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";

/**
 * Reformats a PEM key with correct 64-character line wrapping.
 * This is pure string manipulation — no OpenSSL dependency.
 * Fixes ERR_OSSL_UNSUPPORTED caused by missing line breaks in the PEM body.
 */
function reformatPem(raw: string): string {
  let key = raw.trim();

  // 1. Strip surrounding quotes
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // 2. Convert literal \n to real newlines
  key = key.replace(/\\n/g, "\n");

  // 3. If still no BEGIN header and no newlines, try base64 decode
  if (!key.includes("BEGIN") && !key.includes("\n")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      if (decoded.includes("BEGIN")) key = decoded;
    } catch { /* not base64 */ }
  }

  // 4. Extract header and footer
  const headerMatch = key.match(/-----BEGIN ([^-\n]+)-----/);
  const footerMatch = key.match(/-----END ([^-\n]+)-----/);
  if (!headerMatch || !footerMatch) {
    console.warn("[GitHub App] Could not parse PEM structure, using key as-is");
    return key;
  }
  const header = `-----BEGIN ${headerMatch[1]}-----`;
  const footer = `-----END ${footerMatch[1]}-----`;

  // 5. Extract body: strip all whitespace AND any non-base64 characters
  const body = key
    .replace(header, "")
    .replace(footer, "")
    .replace(/[^A-Za-z0-9+/=]/g, ""); // keep only valid base64 chars

  // 6. Re-wrap body at 64 chars per line (standard PEM format)
  const wrapped = (body.match(/.{1,64}/g) ?? [body]).join("\n");

  const result = `${header}\n${wrapped}\n${footer}`;
  console.log(`[GitHub App] PEM reformatted: ${header}, body length: ${body.length} chars`);
  return result;
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

  const decodedKey = reformatPem(privateKey);

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

  const finalKey = reformatPem(privateKey);

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
