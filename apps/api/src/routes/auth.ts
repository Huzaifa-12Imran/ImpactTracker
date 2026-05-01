import { Router, type Request, type Response } from "express";

const router: Router = Router();

const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

/**
 * GET /api/auth/github
 * Redirect user to GitHub OAuth authorization page.
 */
router.get("/github", (_req: Request, res: Response): void => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.API_URL ?? "http://localhost:4000"}/api/auth/github/callback`;

  // Scopes: repo (private repo access), read:user, user:email
  const scope = "repo read:user user:email";

  const authUrl = `${GITHUB_OAUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
});

/**
 * GET /api/auth/github/callback
 * Handle GitHub OAuth callback, exchange code for token.
 */
router.get("/github/callback", async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  if (!code) {
    res.redirect(`${appUrl}/login?error=no_code`);
    return;
  }

  try {
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      res.redirect(`${appUrl}/login?error=token_exchange_failed`);
      return;
    }

    // Redirect to dashboard with token (in production, set HttpOnly cookie instead)
    res.redirect(`${appUrl}/dashboard?token=${tokenData.access_token}`);
  } catch (error) {
    console.error("[Auth] OAuth callback error:", error);
    res.redirect(`${appUrl}/login?error=server_error`);
  }
});

export default router;
