import type { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[Error]", err.stack ?? err.message);

  const statusCode = (err as Error & { statusCode?: number }).statusCode ?? 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}
