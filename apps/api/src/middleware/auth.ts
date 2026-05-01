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
 * Validate GitHub OAuth session token (simplified).
 * In production, replace with proper JWT session validation.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Store token on request for downstream use
  (req as Request & { userToken?: string }).userToken = authHeader.replace("Bearer ", "");
  next();
}
