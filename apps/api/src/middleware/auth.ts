import type { Request, Response, NextFunction } from "express";

/**
 * Verify admin API key from Authorization header.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = req.headers.authorization;

  if (!adminKey || !authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (token !== adminKey) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}

/**
 * Validate GitHub OAuth session token.
 * Fetches user profile from GitHub to verify the token.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userRes.ok) {
      res.status(401).json({ error: "Invalid or expired GitHub token" });
      return;
    }

    const userData = (await userRes.json()) as { login: string; id: number };
    
    // Store user info on request
    (req as any).user = {
      login: userData.login,
      id: userData.id,
      token: token,
    };

    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}

